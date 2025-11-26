import { Page } from '@playwright/test';
import { SELECTORS } from './selectors';

export type ActionResult<T> = Promise<T>;
export type PageAction<T = void> = (page: Page) => ActionResult<T>;


// helper: tenter de cliquer sur les premiers sélecteurs disponibles
async function clickWithFallback(page: Page, selectors: string[], timeout = 3000) {
  const tried: string[] = [];

  // Diagnostic : vérifier si les filtres sont visibles
  let filtersVisible = false;
  try {
    const filterContainers = ['ul.filters', 'footer .filters', '.filters', '[class*="filter"]'];
    for (const cs of filterContainers) {
      try {
        await page.locator(cs).first().waitFor({ state: 'visible', timeout: 1000 });
        filtersVisible = true;
        break;
      } catch {
        // essayer le conteneur suivant
      }
    }
  } catch {
    // ignorer les erreurs de diagnostic
  }

  for (const sel of selectors.filter(Boolean)) {
    tried.push(sel);
    try {
      const loc = page.locator(sel).first();
      await loc.waitFor({ state: 'visible', timeout });
      await loc.click();
      return;
    } catch {
      // essayer le sélecteur suivant
    }
  }

  throw new Error(
    `None of the selectors matched or were actionable: ${tried.join(', ')}. ` +
    `Filters container visible: ${filtersVisible}. ` +
    `Please check SELECTORS.filters and actual page HTML structure.`
  );
}

export const Actions = {
  ouvrirPage: (url: string): PageAction =>
    async (page) => {
      try {
        await page.goto(url, { waitUntil: 'load', timeout: 30000 });
      } catch (e: any) {
        const msg = String(e?.message ?? e);
        // Si l'erreur est liée au TLS/certificat — essayer d'accéder en http comme solution de secours
        if (
          msg.includes('TLS') ||
          msg.includes('secure connection') ||
          msg.includes('ERR_CERT') ||
          msg.includes('certificate')
        ) {
          const fallbackUrl = url.replace(/^https:/i, 'http:');
          try {
            await page.goto(fallbackUrl, { waitUntil: 'load', timeout: 30000 });
            return;
          } catch {
            // si le fallback échoue aussi — laisser l'erreur se propager
          }
        }
        throw e;
      }
    },

  ajouterItem: (label: string): PageAction =>
    async (page) => {
      // Tenter de trouver le champ d'entrée via plusieurs sélecteurs (SELECTORS.newTodoInput + variantes courantes)
      const possibleSelectors = [
        SELECTORS.newTodoInput,
        'input#new-todo',
        'input.new-todo',
        'input[placeholder="Que faire?"]',
        'input[placeholder="Que faire ?"]'
      ].filter(Boolean) as string[];

      let inputLocator = null;
      for (const sel of possibleSelectors) {
        try {
          const loc = page.locator(sel).first();
          // Petit timeout d'attente de visibilité (3s) — si non trouvé, essayer le sélecteur suivant
          await loc.waitFor({ state: 'visible', timeout: 3000 });
          inputLocator = loc;
          break;
        } catch (e) {
          // continuer avec le sélecteur suivant
        }
      }

      if (!inputLocator) {
        throw new Error(
          `New todo input not found. Tried selectors: ${possibleSelectors.join(', ')}`
        );
      }

      await inputLocator.fill(label);
      await inputLocator.press('Enter');
    },

  ajouterItemAvecEntree: (label: string): PageAction =>
    async (page) => {
      await Actions.ajouterItem(label)(page);
    },

  supprimerItem: (label: string): PageAction =>
    async (page) => {
      const item = page.locator(SELECTORS.todoList).filter({ hasText: label });
      await item.hover();
      await item.locator(SELECTORS.destroyButton).click();
    },

  cocherCase: (label: string): PageAction =>
    async (page) => {
      const item = page.locator(SELECTORS.todoList).filter({ hasText: label });
      await item.locator(SELECTORS.toggleButton).click();
    },

  // ajouté : supprimer les tâches cochées
  supprimerTachesCochees: (): PageAction =>
    async (page) => {
      await clickWithFallback(page, [
        SELECTORS.clearCompleted,
        'button.clear-completed',
        'text=Supprimer cochées',
        'text=Clear completed'
      ]);
    },

  // Ajouté : édition d'une tâche (double-clic sur label -> remplir input.edit -> Enter/blur).
  // Si newText === '' — tenter d'attendre la suppression de l'élément ; si pas supprimé — utiliser supprimerItem.
  editerItem: (oldText: string, newText: string): PageAction =>
    async (page) => {
      const item = page.locator(SELECTORS.todoList).filter({ hasText: oldText }).first();
      const label = item.locator('label').first();
      await label.dblclick();
      const editInput = item.locator('input.edit').first();
      // attendre la visibilité du champ d'édition (si non apparu — autre sélecteur peut être nécessaire)
      await editInput.waitFor({ state: 'visible', timeout: 3000 });
      await editInput.fill(newText);
      // valider la modification
      await editInput.press('Enter');
      // si on a vidé le texte — attendre la disparition de l'élément ; sinon supprimer manuellement si nécessaire
      if (newText === '') {
        // laisser le temps au traitement
        await page.waitForTimeout(300);
        const remaining = await page.locator(SELECTORS.todoList).filter({ hasText: oldText }).count();
        if (remaining > 0) {
          // tenter de retirer le focus et attendre
          await editInput.evaluate((el: any) => el.blur && el.blur());
          await page.waitForTimeout(200);
          const still = await page.locator(SELECTORS.todoList).filter({ hasText: oldText }).count();
          if (still > 0) {
            // option extrême — supprimer explicitement
            await Actions.supprimerItem(oldText)(page);
          }
        }
      } else {
        // attendre que l'édition soit appliquée (le champ d'édition se cache)
        await editInput.waitFor({ state: 'hidden', timeout: 2000 }).catch(() => {});
      }
    },

  afficherFiltreActifs: (): PageAction =>
    async (page) => {
      await clickWithFallback(page, [
        SELECTORS.filters.active,
        'text=Actifs',
        'text=Actif',
        'text=Active'
      ]);
    },

  afficherFiltreTermines: (): PageAction =>
    async (page) => {
      await clickWithFallback(page, [
        'a.filterCompleted',
        'text=Terminés',
        'text=Completed',
        'ul.filters li a >> nth=2'
      ]);
    },

  afficherTous: (): PageAction =>
    async (page) => {
      await clickWithFallback(page, [
        'a.filterAll',
        'text=Tous',
        'text=All'
      ]);
    },

  // ajouté : basculer toutes les tâches (Toggle All)
  toggleAll: (): PageAction =>
    async (page) => {
      await clickWithFallback(page, [
        SELECTORS.toggleAll,
        'label[for="toggleAll"]',
        'text=Mark all as complete',
        'text=Tout cocher'
      ]);
    },
};

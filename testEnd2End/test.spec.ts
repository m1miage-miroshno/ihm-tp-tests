import { test, expect, Page } from '@playwright/test';
import { scenarioAjouterEtSupprimer, scenarioMarquerTermineEtFiltrer, scenarioAjouterEtMarquerUneTerminee, scenarioAjouterEtEditer, scenarioSupprimerViaBoutonX, scenarioToggleAll, scenarioAjouterSynchronise, scenarioSupprimerSynchronise, scenarioCocherSynchronise, scenarioDecocherSynchronise, scenarioAnnulerRefaireBoutons, scenarioModifierSynchronise } from './scenarios';

const URL = 'https://alexdmr.github.io/l3m-2023-2024-angular-todolist/';
/**
 * N:Racine — FaireTodoList
 */
test.describe('N:Racine — FaireTodoList', () => {
  
  /**
   * N:1 — AjouterTâche
   * N:1.1 — SaisirTexte
   * N:1.2 — CliquerEnter
   */
  test.describe('N:1 — AjouterTâche', () => {
    test('Ajouter et supprimer des items', async ({ page }) => {
      await scenarioAjouterEtSupprimer(page, URL);
    });
    // N:1.2 — Ajouter tâche vide (optionnel)
    // test('Ajouter une tâche vide', async ({ page }) => {
    //   await scenarioAjouterTacheVide(page, URL);
    // });
  });

  /**
   * N:2 — GérerLesTâches
   */
  test.describe('N:2 — GérerLesTâches', () => {
    /**
     * N:2.1 — FiltrerLaListe
     */
    test.describe('N:2.1 — FiltrerLaListe', () => {
      test('Marquer comme terminé et filtrer', async ({ page }) => {
        await scenarioMarquerTermineEtFiltrer(page, URL);
      });
    });

    /**
     * N:2.2 — CocherOuDecocher
     */
    test.describe('N:2.2 — CocherOuDecocher', () => {
      test('Ajouter deux tâches et en marquer une comme terminée', async ({ page }) => {
        await scenarioAjouterEtMarquerUneTerminee(page, URL);
      });
      test('Toggle All — cocher/décocher toutes les tâches', async ({ page }) => {
        await scenarioToggleAll(page, URL);
      });
    });

    /**
     * N:2.3 — SupprimerCochéesViaV
     * (Clear completed — à ajouter si implémenté)
     */
  });

  /**
   * N:3 — ModifierUneTâche
   */
  test.describe('N:3 — ModifierUneTâche', () => {
    /**
     * N:3.2 — ModifierNomTache
     */
    test('Ajouter et éditer une tâche', async ({ page }) => {
      await scenarioAjouterEtEditer(page, URL);
    });

    /**
     * N:3.3 — SupprimerUneTâche
     */
    test.describe('N:3.3 — SupprimerUneTâche', () => {
      /**
       * N:3.3.1 — SupprimerViaX
       */
      test('Supprimer via bouton "X"', async ({ page }) => {
        await scenarioSupprimerViaBoutonX(page, URL);
      });
      /**
       * N:3.3.2 — SaisirTexteVide (optionnel)
       */
    });
  });
});

/**
 * Étape 2 — Synchronisation
 */
test.describe('Étape 2 — Synchronisation', () => {
  test('Ajouter une tâche → JSON mis à jour', async ({ page }) => {
    await scenarioAjouterSynchronise(page, URL);
  });
  test('Supprimer une tâche → JSON mis à jour', async ({ page }) => {
    await scenarioSupprimerSynchronise(page, URL);
  });
  test('Cocher une tâche → JSON mis à jour', async ({ page }) => {
    await scenarioCocherSynchronise(page, URL);
  });
  test('Décocher une tâche → JSON mis à jour', async ({ page }) => {
    await scenarioDecocherSynchronise(page, URL);
  });
  test('Modifier une tâche → JSON mis à jour', async ({ page }) => {
    await scenarioModifierSynchronise(page, URL);
  });
  test('Annuler/Refaire avec boutons → JSON mis à jour', async ({ page }) => {
    await scenarioAnnulerRefaireBoutons(page, URL);
  });
});
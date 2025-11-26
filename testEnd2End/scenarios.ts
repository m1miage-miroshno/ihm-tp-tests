import { Page, expect } from '@playwright/test';
import { Actions } from './actions';
import { Verifications } from './verifications';
import { ActionResult } from './actions';


export async function scenarioAjouterEtSupprimer(page: Page, url: string): ActionResult<void> {
  await Actions.ouvrirPage(url)(page);

  const isEmpty = await Verifications.listeEstVide()(page);
  expect(isEmpty).toBe(true);

  await Actions.ajouterItem('Tâche 1')(page);
  await Actions.ajouterItem('Tâche 2')(page);

  const hasItems = await Verifications.listeContient(['Tâche 1', 'Tâche 2'])(page);
  expect(hasItems).toBe(true);

  await Actions.supprimerItem('Tâche 2')(page);

  const remaining = await Verifications.listeContient(['Tâche 1'])(page);
  expect(remaining).toBe(true);
}

// ne passe pas
export async function scenarioAjouterTacheVide(page: Page, url: string): ActionResult<void> {
  await Actions.ouvrirPage(url)(page);

  // ajouter tâche vide
  await Actions.ajouterItem('')(page);

  // la liste doit rester vide
  const estVide = await Verifications.listeEstVide()(page);
  expect(estVide).toBe(true);
}

export async function scenarioMarquerTermineEtFiltrer(page: Page, url: string): ActionResult<void> {
  await Actions.ouvrirPage(url)(page);

  await Actions.ajouterItem('Tâche 1')(page);
  await Actions.ajouterItem('Tâche 2')(page);

  await Actions.cocherCase('Tâche 1')(page);

  await Actions.afficherFiltreActifs()(page);
  const activeOnly = await Verifications.listeContient(['Tâche 2'])(page);
  expect(activeOnly).toBe(true);

  await Actions.afficherFiltreTermines()(page);
  const completedOnly = await Verifications.listeContient(['Tâche 1'])(page);
  expect(completedOnly).toBe(true);
}

export async function scenarioAjouterEtMarquerUneTerminee(page: Page, url: string): ActionResult<void> {
  await Actions.ouvrirPage(url)(page);

  await Actions.ajouterItem('Tâche A')(page);
  await Actions.ajouterItem('Tâche B')(page);

  const hasItems = await Verifications.listeContient(['Tâche A', 'Tâche B'])(page);
  expect(hasItems).toBe(true);

  await Actions.cocherCase('Tâche A')(page);

  // Vérifier que les deux tâches restent dans la liste (une complétée, une active)
  const bothPresent = await Verifications.listeContient(['Tâche A', 'Tâche B'])(page);
  expect(bothPresent).toBe(true);
}

// Ajouté : scénario — ajouter une tâche et l'éditer
export async function scenarioAjouterEtEditer(page: Page, url: string): ActionResult<void> {
  await Actions.ouvrirPage(url)(page);

  // ajouter la tâche avec le texte initial
  await Actions.ajouterItem('Ancienne tâche')(page);

  // s'assurer qu'elle est ajoutée
  const exists = await Verifications.itemExiste('Ancienne tâche')(page);
  expect(exists).toBe(true);

  // éditer vers le nouveau texte
  await Actions.editerItem('Ancienne tâche', 'Nouvelle tâche')(page);

  // vérifier que l'ancien texte a disparu et que le nouveau est présent
  const oldGone = await Verifications.itemNExistePas('Ancienne tâche')(page);
  expect(oldGone).toBe(true);

  const newExists = await Verifications.itemExiste('Nouvelle tâche')(page);
  expect(newExists).toBe(true);
}

// Ajouté : scénario — ajouter une tâche, éditer pour vider et vérifier la disparition
export async function scenarioEditerEtSupprimerSiVide(page: Page, url: string): ActionResult<void> {
  await Actions.ouvrirPage(url)(page);

  const original = 'Tâche à vider';
  await Actions.ajouterItem(original)(page);

  const exists = await Verifications.itemExiste(original)(page);
  expect(exists).toBe(true);

  // Éditer en chaîne vide
  await Actions.editerItem(original, '')(page);

  // Vérifier que la tâche a disparu
  const gone = await Verifications.itemNExistePas(original)(page);
  expect(gone).toBe(true);
}

// Ajouté : ajouter A,B,C; marquer A et C; cliquer sur "Supprimer cochées"; vérifier le résultat
export async function scenarioSupprimerTachesCochees(page: Page, url: string): ActionResult<void> {
  await Actions.ouvrirPage(url)(page);

  await Actions.ajouterItem('Tâche A')(page);
  await Actions.ajouterItem('Tâche B')(page);
  await Actions.ajouterItem('Tâche C')(page);

  // s'assurer que toutes sont ajoutées
  const allPresent = await Verifications.listeContient(['Tâche A', 'Tâche B', 'Tâche C'])(page);
  expect(allPresent).toBe(true);

  // marquer A et C comme complétées
  await Actions.cocherCase('Tâche A')(page);
  await Actions.cocherCase('Tâche C')(page);

  // petite pause pour que l'état soit appliqué
  await new Promise(r => setTimeout(r, 200));

  // supprimer les tâches cochées
  await Actions.supprimerTachesCochees()(page);

  // vérifier que A et C ont disparu, et que B est toujours présente
  const aGone = await Verifications.itemNExistePas('Tâche A')(page);
  const cGone = await Verifications.itemNExistePas('Tâche C')(page);
  const bExists = await Verifications.itemExiste('Tâche B')(page);

  expect(aGone).toBe(true);
  expect(cGone).toBe(true);
  expect(bExists).toBe(true);
}

// Ajouté : scénario — Toggle All on/off et vérifications
export async function scenarioToggleAll(page: Page, url: string): ActionResult<void> {
  await Actions.ouvrirPage(url)(page);

  await Actions.ajouterItem('Tâche 1')(page);
  await Actions.ajouterItem('Tâche 2')(page);

  // cliquer sur Toggle All — attendre que les deux soient cochées
  await Actions.toggleAll()(page);
  const t1Done = await Verifications.itemEstTermine('Tâche 1')(page);
  const t2Done = await Verifications.itemEstTermine('Tâche 2')(page);
  expect(t1Done).toBe(true);
  expect(t2Done).toBe(true);

  // cliquer de nouveau — attendre que les deux redeviennent actives
  await Actions.toggleAll()(page);
  const t1Active = await Verifications.itemEstActif('Tâche 1')(page);
  const t2Active = await Verifications.itemEstActif('Tâche 2')(page);
  expect(t1Active).toBe(true);
  expect(t2Active).toBe(true);
}

// Ajouté : scénario — supprimer une tâche via le bouton "X" (destroy)
export async function scenarioSupprimerViaBoutonX(page: Page, url: string): ActionResult<void> {
  await Actions.ouvrirPage(url)(page);

  const label = 'Tâche à supprimer';
  await Actions.ajouterItem(label)(page);

  // vérifier que la tâche est ajoutée
  const exists = await Verifications.itemExiste(label)(page);
  expect(exists).toBe(true);

  // supprimer via le bouton "X" — Actions.supprimerItem effectue hover + click sur destroy
  await Actions.supprimerItem(label)(page);

  // vérifier que la tâche a disparu
  const gone = await Verifications.itemNExistePas(label)(page);
  expect(gone).toBe(true);
}

// ETAPE 2
// Modèle de Tâches : N1 AjouterTâche (synchro Étape 1 → Étape 2 + JSON)
// Vérifier la synchro Étape 1 → JSON Étape 2
export async function scenarioAjouterSynchronise(page: Page, url: string): ActionResult<void> {
  await Actions.ouvrirPage(url)(page);

  // Ajouter une tâche dans Étape 1
  await Actions.ajouterItem('Tâche synchro')(page);

  // Vérifier que le JSON (dans <pre>) contient la tâche
  const jsonText = await page.locator('h2:text("Étape 1") + pre').innerText();
  expect(jsonText).toContain('"label": "Tâche synchro"');
}


// Étape 2 : Supprimer une tâche → JSON mis à jour
export async function scenarioSupprimerSynchronise(page: Page, url: string): ActionResult<void> {
  await Actions.ouvrirPage(url)(page);

  await Actions.ajouterItem('À supprimer')(page);
  await Actions.supprimerItem('À supprimer')(page);

  const jsonText = await page.locator('h2:text("Étape 1") + pre').innerText();
  expect(jsonText).not.toContain('"label": "À supprimer"');
}

// Étape 2 : Cocher une tâche → JSON mis à jour
export async function scenarioCocherSynchronise(page: Page, url: string): ActionResult<void> {
  await Actions.ouvrirPage(url)(page);

  await Actions.ajouterItem('À cocher')(page);
  await Actions.cocherCase('À cocher')(page);

  const jsonText = await page.locator('h2:text("Étape 1") + pre').innerText();
  expect(jsonText).toContain('"label": "À cocher"');
  expect(jsonText).toContain('"done": true');
}

// Étape 2 : Décocher une tâche → JSON mis à jour
export async function scenarioDecocherSynchronise(page: Page, url: string): ActionResult<void> {
  await Actions.ouvrirPage(url)(page);

  await Actions.ajouterItem('À décocher')(page);
  await Actions.cocherCase('À décocher')(page);
  await Actions.cocherCase('À décocher')(page);

  const jsonText = await page.locator('h2:text("Étape 1") + pre').innerText();
  expect(jsonText).toContain('"label": "À décocher"');
  expect(jsonText).toContain('"done": false');
}

// Étape bonus : Annuler/Refaire via boutons
export async function scenarioAnnulerRefaireBoutons(page: Page, url: string): ActionResult<void> {
  await Actions.ouvrirPage(url)(page);

  await Actions.ajouterItem('Tâche annulable')(page);

  // Annuler
  await page.click('button:has-text("Annuler")');
  let existe = await Verifications.itemExiste('Tâche annulable')(page);
  expect(existe).toBe(false);

  // Refaire
  await page.click('button:has-text("Refaire")');
  existe = await Verifications.itemExiste('Tâche annulable')(page);
  expect(existe).toBe(true);
}

// Modifier une tâche → JSON mis à jour
export async function scenarioModifierSynchronise(page: Page, url: string): ActionResult<void> {
  await Actions.ouvrirPage(url)(page);

  await Actions.ajouterItem('Ancien nom')(page);
  await Actions.editerItem('Ancien nom', 'Nouveau nom')(page);

  const jsonText = await page.locator('h2:text("Étape 1") + pre').innerText();
  expect(jsonText).toContain('"label": "Nouveau nom"');
  expect(jsonText).not.toContain('"label": "Ancien nom"');
}




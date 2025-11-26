import { Page, expect } from '@playwright/test';
import { Actions } from './actions';
import { Verifications } from './verifications';
import { ActionResult } from './actions';


// N:1 (AjouterTâche) -> N:1.1 (SaisirTexte), N:1.2 (CliquerEnter)
// N:3.3.1 (SupprimerViaX) — scénario qui ajoute des tâches puis supprime une via le bouton X
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

// N:1 (AjouterTâche) -> N:1.1 (SaisirTexte vide), N:1.2 (CliquerEnter)
// test du comportement lorsqu'on tente d'ajouter une tâche sans texte
export async function scenarioAjouterTacheVide(page: Page, url: string): ActionResult<void> {
  await Actions.ouvrirPage(url)(page);

  // ajouter tâche vide
  await Actions.ajouterItem('')(page);

  // la liste doit rester vide
  const estVide = await Verifications.listeEstVide()(page);
  expect(estVide).toBe(true);
}

// N:2 (GérerLesTâches) -> N:2.2 (CocherOuDecocher), N:2.1 (FiltrerLaListe)
// N:2.1.2 (AfficherTâchesActives), N:2.1.3 (AfficherTâchesComplétées)
// scénario qui coche une tâche puis vérifie les filtres actifs/complétés
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

// N:1 (AjouterTâche) + N:2.2 (CocherOuDecocher)
// ajouter deux tâches et marquer l'une d'elles comme terminée (vérification du statu)
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

// N:1 (AjouterTâche) + N:3 (ModifierUneTâche) -> N:3.2 (ModifierNomTache)
// scénario qui ajoute une tâche puis édite son texte
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

// N:1 (AjouterTâche) + N:3.2 (ModifierNomTache) -> N:3.3.2 (SaisirTexteVide)
// scénario qui édite une tâche pour vider le texte et vérifier sa suppression
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

// N:2 (GérerLesTâches) -> N:2.2 (CocherOuDecocher) et N:2.3 (SupprimerCochéesViaV)
// ajouter A,B,C, cocher A et C, puis supprimer les cochées
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

// N:2.2 (CocherOuDecocher) — action de basculement global (Toggle All)
// scénario Toggle All : cocher/décocher toutes les tâches
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

// N:3.3 (SupprimerUneTâche) -> N:3.3.1 (SupprimerViaX)
// scénario qui supprime une tâche via le bouton "X" (destroy)
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

// ETAPE 2 — Synchronisation UI ↔ JSON
// N:1 (AjouterTâche) et synchronisation visée avec l'ETAPE 2 (JSON)
// vérifier que l'ajout est répercuté dans le JSON (pré)
export async function scenarioAjouterSynchronise(page: Page, url: string): ActionResult<void> {
  await Actions.ouvrirPage(url)(page);

  // Ajouter une tâche dans Étape 1
  await Actions.ajouterItem('Tâche synchro')(page);

  // Vérifier que le JSON (dans <pre>) contient la tâche
  const jsonText = await page.locator('h2:text("Étape 1") + pre').innerText();
  expect(jsonText).toContain('"label": "Tâche synchro"');
}


// ETAPE 2 — suppression synchronisée
// N:3.3 (SupprimerUneTâche) et synchronisation vers JSON
export async function scenarioSupprimerSynchronise(page: Page, url: string): ActionResult<void> {
  await Actions.ouvrirPage(url)(page);

  await Actions.ajouterItem('À supprimer')(page);
  await Actions.supprimerItem('À supprimer')(page);

  const jsonText = await page.locator('h2:text("Étape 1") + pre').innerText();
  expect(jsonText).not.toContain('"label": "À supprimer"');
}

// ETAPE 2 — cocher ↔ JSON
// N:2.2 (CocherOuDecocher) avec vérification de la synchronisation JSON ("done": true)
export async function scenarioCocherSynchronise(page: Page, url: string): ActionResult<void> {
  await Actions.ouvrirPage(url)(page);

  await Actions.ajouterItem('À cocher')(page);
  await Actions.cocherCase('À cocher')(page);

  const jsonText = await page.locator('h2:text("Étape 1") + pre').innerText();
  expect(jsonText).toContain('"label": "À cocher"');
  expect(jsonText).toContain('"done": true');
}

// ETAPE 2 — décocher ↔ JSON
// N:2.2 (CocherOuDecocher) avec vérification de la synchronisation JSON ("done": false)
export async function scenarioDecocherSynchronise(page: Page, url: string): ActionResult<void> {
  await Actions.ouvrirPage(url)(page);

  await Actions.ajouterItem('À décocher')(page);
  await Actions.cocherCase('À décocher')(page);
  await Actions.cocherCase('À décocher')(page);

  const jsonText = await page.locator('h2:text("Étape 1") + pre').innerText();
  expect(jsonText).toContain('"label": "À décocher"');
  expect(jsonText).toContain('"done": false');
}

// Annuler/Refaire (boutons) — scénario bonus
// Ce scénario couvre l'UX d'annulation/refaire via boutons (fonctionnalité bonus)
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

// N:3.2 (ModifierNomTache) -> synchronisation vers ETAPE 2 (JSON)
// éditer une tâche et vérifier que le JSON est mis à jour
export async function scenarioModifierSynchronise(page: Page, url: string): ActionResult<void> {
  await Actions.ouvrirPage(url)(page);

  await Actions.ajouterItem('Ancien nom')(page);
  await Actions.editerItem('Ancien nom', 'Nouveau nom')(page);

  const jsonText = await page.locator('h2:text("Étape 1") + pre').innerText();
  expect(jsonText).toContain('"label": "Nouveau nom"');
  expect(jsonText).not.toContain('"label": "Ancien nom"');
}

// Bonus clavier Annuler/Refaire
// Scénario pour tester Annuler/Refaire via clavier (CTRL/CMD+Z, CTRL+Y ou variantes) — comportement bonus
export async function scenarioAnnulerRefaireClavier(page: Page, url: string): ActionResult<void> {
  await Actions.ouvrirPage(url)(page);

  await Actions.ajouterItem('Tâche annulable')(page);

  // Annuler avec CTRL+Z (ou CMD+Z sur Mac)
  await page.keyboard.press('Control+Z');
  let existe = await Verifications.itemExiste('Tâche annulable')(page);
  expect(existe).toBe(false);

  // Refaire avec CTRL+Y (ou CMD+Y sur Mac)
  await page.keyboard.press('Control+Y');
  existe = await Verifications.itemExiste('Tâche annulable')(page);
  expect(existe).toBe(true);
}




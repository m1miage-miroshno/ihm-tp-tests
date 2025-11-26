import { test, expect, Page } from '@playwright/test';
import { scenarioAjouterEtSupprimer, scenarioMarquerTermineEtFiltrer, scenarioAjouterEtMarquerUneTerminee, scenarioAjouterEtEditer, scenarioSupprimerViaBoutonX, scenarioToggleAll, scenarioAjouterSynchronise, scenarioSupprimerSynchronise, scenarioCocherSynchronise, scenarioDecocherSynchronise } from './scenarios';
import { GestionDesItems } from './GestionDesItems';
import { Actions } from './actions';
import { SELECTORS } from './selectors';

const URL = 'https://alexdmr.github.io/l3m-2023-2024-angular-todolist/';

test.describe('E2E TodoMVC Tests', () => {
  test('Scénario: Ajouter et supprimer des items', async ({ page }) => {
    await scenarioAjouterEtSupprimer(page, URL); // передаём URL
  });

  // dans le bon fonctionnement, ce test doit passer 
//   test('Scénario: Ajouter une tâche vide', async ({ page }) => {
//   await scenarioAjouterTacheVide(page, URL);
// });

  test('Scénario: Marquer comme terminé et filtrer', async ({ page }) => {
    await scenarioMarquerTermineEtFiltrer(page, URL); 
  });

  test('Scénario: Ajouter deux tâches et en marquer une comme terminée', async ({ page }) => {
    await scenarioAjouterEtMarquerUneTerminee(page, URL); 
  });

  test('Scénario: Ajouter et éditer une tâche', async ({ page }) => {
    await scenarioAjouterEtEditer(page, URL);
  });

  test('Scénario: Supprimer via bouton "X"', async ({ page }) => {
    await scenarioSupprimerViaBoutonX(page, URL);
  });

  test('Scénario: Toggle All — cocher/décocher toutes les tâches', async ({ page }) => {
    await scenarioToggleAll(page, URL);
  });

  

});

test.describe('E2E TodoMVC Étape 2 (synchronisation)', () => {
  test('Ajouter une tâche et vérifier synchro', async ({ page }) => {
    await scenarioAjouterSynchronise(page, URL);
  });

  test('Supprimer une tâche et vérifier synchro', async ({ page }) => {
    await scenarioSupprimerSynchronise(page, URL);
  });

  test('Cocher une tâche et vérifier synchro', async ({ page }) => {
    await scenarioCocherSynchronise(page, URL);
  });

  test('Décocher une tâche et vérifier synchro', async ({ page }) => {
    await scenarioDecocherSynchronise(page, URL);
  });
});


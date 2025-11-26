import { test, expect, Page } from '@playwright/test';
import { scenarioAjouterEtSupprimer, scenarioMarquerTermineEtFiltrer, scenarioAjouterEtMarquerUneTerminee, scenarioAjouterEtEditer, scenarioEditerEtSupprimerSiVide, scenarioSupprimerTachesCochees, scenarioToggleAll } from './scenarios';
import { GestionDesItems } from './GestionDesItems';
import { Actions } from './actions';
import { SELECTORS } from './selectors';

const URL = 'https://alexdmr.github.io/l3m-2023-2024-angular-todolist/';

test.describe('E2E TodoMVC Tests', () => {
  test('Scénario: Ajouter et supprimer des items', async ({ page }) => {
    await scenarioAjouterEtSupprimer(page, URL); // передаём URL
  });

  test('Scénario: Marquer comme terminé et filtrer', async ({ page }) => {
    await scenarioMarquerTermineEtFiltrer(page, URL); 
  });

  test('Scénario: Ajouter deux tâches et en marquer une comme terminée', async ({ page }) => {
    await scenarioAjouterEtMarquerUneTerminee(page, URL); 
  });

  test('Scénario: Ajouter et éditer une tâche', async ({ page }) => {
    await scenarioAjouterEtEditer(page, URL);
  });

  test('Scénario: Éditer une tâche en vide et vérifier suppression', async ({ page }) => {
    await scenarioEditerEtSupprimerSiVide(page, URL);
  });

  test('Scénario: Supprimer les tâches cochées (A et C) et vérifier B reste', async ({ page }) => {
    await scenarioSupprimerTachesCochees(page, URL);
  });

  test('Scénario: Toggle All — cocher/décocher toutes les tâches', async ({ page }) => {
    await scenarioToggleAll(page, URL);
  });

});

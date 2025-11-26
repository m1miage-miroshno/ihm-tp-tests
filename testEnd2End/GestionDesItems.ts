import { Page } from '@playwright/test';
import { Actions, ActionResult } from './actions';
import { Verifications } from './verifications';

export interface ListData {
  items: string[];
}

export class GestionDesItems {
  private listData: ListData = { items: [] };

  async ajouterItem(page: Page, label: string): ActionResult<void> {
    await Actions.ajouterItem(label)(page);
    this.listData.items.push(label);
  }

  async supprimerItem(page: Page, label: string): ActionResult<void> {
    await Actions.supprimerItem(label)(page);
    this.listData.items = this.listData.items.filter((item) => item !== label);
  }

  async verifierListe(page: Page): ActionResult<boolean> {
    return await Verifications.listeContient(this.listData.items)(page);
  }

  getItems(): string[] {
    return this.listData.items;
  }

  resetData(): void {
    this.listData.items = [];
  }
}
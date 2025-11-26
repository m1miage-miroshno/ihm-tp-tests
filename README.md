## Décomposition des tâches (voir fichier mc-tp-note.kxml)

| Niveau | Tâche | Opérateur | Type d'Exécutant | Rôle de la Tâche |
|-------|-------|-----------|------------------|------------------|
| N:Racine | FaireTodoList | Alternatif | Abstrait | L’objectif principal de l'application. |
| N:1 | AjouterTâche | Séquentiel | Abstrait | Procédure pour insérer un nouvel élément. |
| N:1.1 | SaisirTexte | N/A | Humain | Saisie du texte de la tâche. |
| N:1.2 | CliquerEnter | N/A | Interaction | Validation et envoi au système. |
| N:2 | GérerLesTâches *(OPT)* | Parallèle | Abstrait | Gérer l'état et l'affichage de la liste. |
| N:2.1 | FiltrerLaListe | Alternatif | Abstrait | Choisir quelle catégorie de tâches afficher. |
| N:2.1.1 | AfficherToutesTâchesActives | N/A | Interaction | Afficher toutes les tâches (filtre **"Tous"**). |
| N:2.1.2 | AfficherTâchesActives | N/A | Interaction | Afficher uniquement les tâches actives. |
| N:2.1.3 | AfficherTâchesComplétées | N/A | Interaction | Afficher uniquement les tâches complétées. |
| N:2.2 | CocherOuDecocher | N/A | Interaction | Changer le statut d'une tâche. |
| N:2.3 | SupprimerCochéesViaV | N/A | Interaction | Nettoyage des tâches complétées (**"Clear completed"**). |
| N:3 | ModifierUneTâche *(OPT)* | Alternatif | Abstrait | Modification d'un élément existant. |
| N:3.1 | CocherOuDecocher | N/A | Interaction | Changer le statut d'une tâche (même action que N:2.2). |
| N:3.2 | ModifierNomTache | N/A | Interaction | Action d'édition du texte de la tâche. |
| N:3.3 | SupprimerUneTâche | Alternatif | Abstrait | Procédure pour supprimer un élément. |
| N:3.3.1 | SupprimerViaX | N/A | Interaction | Suppression via le bouton **"X"** (icône au survol). |
| N:3.3.2 | SaisirTexteVide | N/A | Interaction | Suppression par édition et vidage du texte. |

## Objectif
Ce projet contient une suite de tests end‑to‑end (E2E) pour l’application TodoMVC Angular. Les tests vérifient le bon fonctionnement des différentes étapes du projet :
Étape 1 : gestion des tâches via l’interface principale.
Étape 2 : synchronisation des tâches entre deux blocs et mise à jour du JSON.
Étape bonus : fonctionnalités Annuler / Refaire (Undo/Redo).

## Structure du projet
`selectors.ts` → Définit les sélecteurs CSS pour accéder aux éléments de l’interface (Étape 1 et Étape 2).
`actions.ts` → Contient les actions réutilisables (ajouter, supprimer, cocher, éditer).
`scenarios.ts` → Regroupe les scénarios de test (séquences d’actions + vérifications).
`test.spec.ts` → Fichier principal qui organise les tests en blocs logiques (test.describe) selon le modèle de tâches.


## Organisation des tests
Les tests sont regroupés par niveau de tâche (modèle hiérarchique) :
N:1 AjouterTâche → saisie et validation d’une nouvelle tâche.
N:2 GérerLesTâches → filtrer, cocher/décocher, supprimer.
N:3 ModifierUneTâche → éditer ou supprimer via bouton X.
Étape 2 (Synchronisation) → vérifier que les actions dans un bloc apparaissent dans l’autre et dans le JSON.
Étape bonus (Annuler/Refaire) → tester les boutons et les raccourcis clavier (CTRL+Z / CTRL+Y).

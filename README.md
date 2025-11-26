# Décomposition des tâches

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

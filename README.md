<h1>Architecture du Système</h1>

Le schéma ci-dessus illustre l'architecture technique globale du projet Mohassib. L'application repose sur un écosystème robuste et découplé, combinant une interface utilisateur moderne développée avec React et une API REST sécurisée par Spring Security et propulsée par Spring Boot. Le cœur métier intègre un moteur de calcul fiscal natif en Java (gestion des taxes et de la TVA) ainsi qu'un module de génération de factures au format PDF. L'ensemble de l'infrastructure, incluant la base de données relationnelle PostgreSQL et le service de messagerie Zoho Mail, est entièrement conteneurisé à l'aide de Docker afin de garantir un déploiement fluide, isolé et hautement évolutif.

<img width="1408" height="768" alt="Gemini_Generated_Image_n8lcgzn8lcgzn8lc" src="https://github.com/user-attachments/assets/55ba05c8-b037-49e4-ae55-fa22a03d1073" />


<h1>Modèle Relationnel et Ceur du Système</h1>

Le schéma ci-dessus présente l'architecture des entités qui constituent le cœur fonctionnel de Mohassib. Le système s'articule autour d'une relation exclusive entre l'Utilisateur et son Entreprise, garantissant un cloisonnement logique des données. Depuis ce noyau central, l'application orchestre trois modules opérationnels interconnectés : la gestion commerciale (suivi des Clients, Factures, règlements et Dépenses), le pilotage des ressources humaines (suivi des Employés, génération des livrets et Fiches de paie) et la conformité légale (centralisation des Entrées TVA et production des Déclarations TVA). Un sous-système transverse assure l'observabilité et la traçabilité des actions via un journal de Logs d'audit.

<img width="1408" height="663" alt="Gemini_Generated_Image_14dihe14dihe14di (1)" src="https://github.com/user-attachments/assets/17550b6b-771f-465e-a29a-4d527e982cf7" />

Groupe 3
Membres : DERENSY Dany, GRANIER Antoine

# Étude de Faisabilité de NestJs, GraphQL et Redis

## Fonctionnement de NestJs

NestJs est un framework pour construire des applications côté serveur avec Node.js en utilisant TypeScript. Il se distingue par son architecture modulaire, inspirée d’Angular, qui permet de structurer le code de manière organisée et maintenable.

## Architecture Modulaire de NestJs

NestJs utilise une architecture modulaire pour diviser l’application en différentes parties logiques.

Modules : Les modules regroupent des composants liés par fonctionnalité.

Contrôleurs : Les contrôleurs gèrent les requêtes HTTP entrantes.

Services : Les services contiennent la logique métier.

Middlewares : Ils peuvent intercepter les requêtes avant qu'elles n'atteignent le contrôleur.

Pipes : Utilisés pour transformer ou valider les données.

Guards : Utilisés pour la logique d'autorisation.

## Intérêt d'utiliser GraphQL pour le développement d'une API

GraphQL est un langage de requête pour les APIs et un runtime pour exécuter ces requêtes sur vos données.

### Avantages de GraphQL

Flexibilité des Requêtes : Permet aux clients de demander exactement les données dont ils ont besoin.

Efficacité : Un seul appel peut récupérer toutes les données requises.

Typage Fort : Facilite la validation et la documentation des APIs.

Évolution des APIs : Permet d'ajouter des champs sans affecter les clients existants.

### Inconvénients de GraphQL

Complexité de la Mise en Œuvre : Plus complexe à mettre en place qu'une API REST.

Performance : Des requêtes complexes peuvent être difficiles à optimiser.
Sécurité des Données : Besoin de sécuriser les données pour éviter les abus.

## Pertinence de Mixer NestJs, GraphQL et Redis

Redis est une base de données en mémoire utilisée comme cache, magasin de données, et moteur de message. L'intégration de Redis avec NestJs et GraphQL peut apporter des avantages significatifs.

### Avantages de Combiner NestJs, GraphQL et Redis

#### Amélioration des Performances :

Caching : Redis peut être utilisé pour mettre en cache les résultats de requêtes fréquentes, réduisant ainsi le temps de réponse et la charge sur la base de données principale.

Sessions : Gestion efficace des sessions utilisateur grâce à Redis.
Scalabilité :

Scalabilité Horizontale : Redis facilite la mise à l'échelle horizontale des applications en distribuant les charges de travail et en réduisant la latence des requêtes.

#### Flexibilité :

Données Temporelles : Gestion efficace des données temporaires et des sessions avec expiration automatique.

Pub/Sub : Utilisation du système de publication/abonnement de Redis pour les notifications en temps réel.

#### Optimisation des Requêtes GraphQL :

Cache de Requêtes : Mise en cache des résultats de requêtes GraphQL pour améliorer les performances.

Rate Limiting : Utilisation de Redis pour implémenter des limites de taux et prévenir les abus d'API.

#### Scénarios d'Utilisation

API en Temps Réel : Utiliser GraphQL Subscriptions avec Redis Pub/Sub pour implémenter des fonctionnalités en temps réel comme les notifications, les mises à jour en direct, etc.

Gestion des Sessions : Stocker les sessions utilisateur dans Redis pour une gestion rapide et efficace.

Optimisation des Performances : Utiliser Redis pour mettre en cache les réponses des requêtes GraphQL, réduire la charge de la base de données et améliorer le temps de réponse.

# Conclusion

Combiner NestJs, GraphQL et Redis offre une solution puissante pour développer des APIs performantes et scalables. NestJs fournit une structure modulaire et une base robuste pour le développement. GraphQL apporte flexibilité et efficacité dans la récupération des données. Redis, en tant que cache et gestionnaire de données temporaires, améliore considérablement les performances et la scalabilité de l'application. Cette combinaison permet de créer des applications performantes, réactives et faciles à maintenir.

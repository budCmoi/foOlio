export const siteProfile = {
  name: 'Mohamed Ali',
  handle: 'mohamedali',
  headline: ['Mohamed', 'Ali'],
  role: 'Designer frontend et motion',
  roleCaps: 'DESIGNER FRONTEND ET MOTION',
  location: 'Paris, France',
  availability: 'Disponible pour des missions choisies en 2026',
  heroIntro: 'Base a Paris, disponible a distance. Quatre ans a concevoir des interfaces, portfolios et lancements ou le mouvement sert d\'abord la clarte.',
  heroPills: [
    { label: 'Disponible pour mission', tone: 'active' },
    { label: 'Paris, France' },
    { label: '4 ans d\'experience' },
  ],
  workIntro: 'Une selection resserree d\'interfaces construites autour du rythme, de la retenue et de systemes motion prets pour la production.',
  workAppendix: 'Un dossier PDF avec davantage d\'etudes de cas, de specs motion et de vues systeme est disponible sur demande pour les missions serieuses.',
  workCtaLabel: 'Demander le dossier',
  workCtaHref: 'mailto:hello@foolio.dev?subject=Demande%20de%20dossier%20PDF',
  marquee: [
    'Vision systeme',
    'Choregraphie de scroll',
    'Design x dev',
    'Narration visuelle',
    'Systemes frontend',
    'Direction motion',
    'Precision responsive',
    'Interfaces premium',
  ],
  about: {
    paragraphs: [
      'Quatre ans a dessiner et coder des interfaces premium, entre experiences editoriales, pages de lancement et systemes de narration produit.',
      'Mon point de depart reste la hierarchie et le rythme. Chaque section doit savoir pourquoi elle existe, combien de temps elle garde l\'attention et comment elle transmet la suite.',
      'J\'aime construire le systeme derriere le spectacle : une architecture Vue propre, des timelines GSAP tenables dans le temps et des composants capables d\'absorber du nouveau contenu sans perdre leur tenue.',
    ],
    highlights: [
      {
        title: '4 ans de pratique',
        subtitle: 'Portfolios, lancements et surfaces produit premium',
        note: '2022 - 2026',
      },
      {
        title: 'Vue + GSAP',
        subtitle: 'Systemes motion pensés pour la mise en prod',
        note: 'Mise en prod',
      },
      {
        title: 'Design x code',
        subtitle: 'Du concept au composant final sans rupture',
        note: 'De bout en bout',
      },
      {
        title: 'AI DEV',
        subtitle: 'Automatisations, assistants de production et iterations plus rapides',
        note: 'Workflow',
      },
    ],
    experience: [
      {
        company: 'Parcours autodidacte',
        role: 'Aucun poste en entreprise : progression construite par curiosite, tests et execution reelle.',
        period: 'Depuis 2022',
      },
      {
        company: 'Projets complexes',
        role: 'Interfaces, motion et systemes frontend menes seul de l idee a la mise en ligne.',
        period: 'En continu',
      },
    ],
    skills: [
      'Vue 3',
      'GSAP',
      'ScrollTrigger',
      'Lenis',
      'Systemes de design',
      'Narration produit',
      'Performance',
      'Architecture de composants',
      'Specs motion',
      'Prototypage rapide',
    ],
    ctaLabel: 'Demander le CV',
    ctaHref: 'mailto:hello@foolio.dev?subject=Demande%20de%20CV',
  },
  contact: {
    eyebrow: 'Prendre contact',
    overline: 'Bonjour !',
    title: 'Parlons d\'un projet qui doit vraiment marquer.',
    cta: 'Discutons',
    email: 'hello@foolio.dev',
    links: [
      { label: 'Email', href: 'mailto:hello@foolio.dev' },
      { label: 'Projets', href: '/#work' },
      { label: 'A propos', href: '/#about' },
    ],
  },
}

export const baseProjects = [
  {
    id: 'studio-luma-launch',
    client: 'Studio Luma',
    title: 'Creer une page de lancement qui vend l\'atmosphere avant meme l\'offre.',
    description: 'Une landing page cinematographique concue autour de reveals au scroll maitrises, d\'une typographie surdimensionnee et d\'un parcours de conversion qui reste premium du hero jusqu\'a la prise de contact.',
    images: [
      '/projects/aether-01.svg',
      '/projects/aether-02.svg',
    ],
    tech: ['Vue 3', 'GSAP', 'ScrollTrigger', 'Lenis', 'SCSS'],
    tags: ['Narration', 'Conversion'],
    metrics: [
      { value: '+31%', label: 'Hausse des leads qualifies' },
      { value: '2.4x', label: 'Temps moyen de session' },
    ],
    link: 'https://example.com/aether',
    year: '2026',
    role: 'Direction creative / Motion frontend',
    accent: '#d9ff70',
    statement: 'Un recit spatial pense pour retenir l\'attention, ralentir le scroll et rendre la prise de contact naturelle.',
    results: ['Narration premium du lancement', 'Rythme editorial du hero au CTA', 'Galerie modulaire capable de grandir avec le contenu'],
  },
  {
    id: 'neoform-demo-flow',
    client: 'NeoTaste',
    title: 'Transformer des utilisateurs d essai en membres fideles.',
    description: 'Case study retention produit : comment une quete d activation a augmente la conversion trial-to-paid et l adoption des actions a valeur.',
    images: [
      '/projects/solenne-01.svg',
      '/projects/solenne-02.svg',
    ],
    tech: ['Vue 3', 'GSAP', 'SplitType', 'Lenis', 'SCSS'],
    tags: ['Retention', 'Gamification'],
    metrics: [
      { value: '+18%', label: 'Demandes de demo completees' },
      { value: '-22%', label: 'Sorties sur le hero' },
    ],
    link: 'https://example.com/solenne',
    year: '2025 - 2026',
    role: 'Senior Product Designer',
    accent: '#efc87d',
    statement: 'Comment guider des nouveaux utilisateurs vers les actions qui creent la valeur du produit, avant leur premier paiement.',
    results: ['Parcours d activation structure', 'Quete optionnelle mais visible', 'Progression orientee actions a valeur'],
    caseStudy: {
      intro: {
        before: 'NeoTaste aide les utilisateurs a decouvrir restaurants, bars et cafes avec des offres exclusives debloquees dans l application.',
        highlight: 'La mission etait claire : transformer la periode d essai en preuve de valeur concrete.',
        after: 'Ce projet raconte comment nous avons reconstruit l activation, de l analyse du probleme jusqu aux resultats business, section par section.',
      },
      sections: [
        {
          number: '01',
          label: 'Enonce du probleme',
          title: 'De nombreux utilisateurs en periode d essai ne profitaient que d une seule offre.',
          paragraphs: [
            'Le modele NeoTaste repose sur un essai gratuit de 30 jours. Pendant cette fenetre, l utilisateur doit ressentir assez de valeur pour accepter le premier paiement automatique.',
            'En lisant les cohortes, un pattern est revenu partout : beaucoup d utilisateurs testaients une seule offre, puis s arretaient. Tant que ce cap de la deuxieme offre n etait pas franchi, la conversion restait faible.',
            'Le probleme etait donc double. Cote business, il fallait augmenter la conversion trial-to-paid. Cote experience, il fallait aider les nouveaux utilisateurs a vivre la promesse de l app assez vite et assez souvent.',
            'Cette section a fixe la question directrice de tout le projet : comment faire passer un utilisateur de la curiosite a l habitude utile avant la fin de l essai ?'
          ],
          insight: {
            eyebrow: 'Signal cle',
            title: 'Les utilisateurs qui atteignaient 2 offres convertissaient environ 4x plus que ceux qui restaient a 1.',
            items: [
              { value: '1 offre', label: 'point de friction dominant pendant l essai' },
              { value: '2 offres', label: 'palier d activation determinant' },
              { value: '4x', label: 'conversion vs cohortes a 1 offre' },
            ],
            note: 'Le projet a ete cadre comme un enjeu d activation comportementale, pas seulement de marketing ou de surface UI.',
          },
        },
        {
          number: '02',
          label: 'Hypothese',
          title: 'Pourquoi abandonner les streaks pour une quete structuree.',
          paragraphs: [
            'La premiere intuition de l equipe etait un schema classique de gamification : streaks, check-ins quotidiens et mecanismes de recompense de frequence.',
            'En atelier, nous avons rapidement vu la limite : ouvrir l application n est pas l action qui cree la valeur NeoTaste. La vraie valeur vient des sorties, des redemptions et du retour a l app apres une experience positive.',
            'Les streaks risquaient donc de renforcer un mauvais comportement. Pire, ils introduisaient une logique punitive des qu une journee etait manquee, ce qui creait de l anxiete plus que de l engagement.',
            'Nous avons reformule l hypothese autour d actions significatives : si on guide les utilisateurs vers les gestes qui predisent la conversion, la retention suivra naturellement.',
          ],
          callout: {
            eyebrow: 'Hypothese',
            title: 'Si nous guidons les nouveaux utilisateurs dans les fonctionnalites cle via une quete structuree, ils comprendront plus vite la valeur et convertiront davantage.',
            note: 'La piste a ete challengee en amont avec Gemini pour tester les objections et durcir le raisonnement avant les arbitrages stakeholders.',
          },
        },
        {
          number: '03',
          label: 'Recherche & analyse',
          title: 'Trois axes de travail, une seule direction.',
          workstreams: [
            {
              title: 'Validation du concept',
              body: 'Etude Maze non moderee avec non-utilisateurs NeoTaste pour tester le format de quete, le volume de taches et la logique de recompense.',
            },
            {
              title: 'Analyse concurrentielle',
              body: 'Benchmark Mobbin + apps de creation d habitudes pour isoler les patterns onboarding qui poussent vers des actions utiles.',
            },
            {
              title: 'Donnees de cohorte',
              body: 'Baseline pre-lancement demandee a la data team pour mesurer proprement l impact reel de la quete apres mise en ligne.',
            },
          ],
          paragraphs: [
            'Ces trois flux ont servi en parallele : valider l intuition, comprendre les comportements reels et poser une base mesureable avant la mise en production.',
            'Gemini a ete utile comme couche de recherche qualitative rapide pour challenger les hypotheses entre deux cycles de decision, sans remplacer les donnees produit ni les tests utilisateurs.',
            'Le mapping du parcours d activation (sign-up, setup, aha, habit, retention) a revele un trou tres precis : la transition entre le premier moment de comprehension et le debut d habitude.',
            'C est ce trou que la quete devait combler, sans alourdir l experience et sans bloquer les utilisateurs autonomes.',
          ],
          media: {
            eyebrow: 'Recherche onboarding concurrente',
            image: '/projects/solenne-01.svg',
            caption: 'Les meilleures apps guident tres tot vers des actions cle avant d attendre une habitude stable.',
          },
        },
        {
          number: '04',
          label: 'Pilotage',
          title: 'Rester concentre sur la quete.',
          paragraphs: [
            'Le coeur de l equipe etait compact : PM, UX Researcher et design produit. Cette composition a accelere la prise de decision, mais les tensions sont apparues lors des revues de direction.',
            'Le principal point de friction a ete l ajout d une tache referral dans la quete. D un point de vue croissance, la demande etait logique. D un point de vue activation, elle cassait la sequence pedagogique.',
            'Nous avons pose une regle stricte : chaque tache devait rapprocher l utilisateur de la valeur personnelle du produit. Le referral servait surtout la croissance, pas la comprehension.',
            'En testant deux versions, les retours ont confirme l intuition : la tache referral etait percue comme prematuree. Cette preuve a permis d obtenir un alignement stakeholder sans conflit politique inutile.',
          ],
        },
        {
          number: '05',
          label: 'Processus de design',
          title: 'Cinq etapes pour amener les nouveaux utilisateurs a leur premiere vraie victoire.',
          question: 'Question de design : quelles 5 actions transforment le mieux "interesse" en "j ai compris" pendant les 30 jours d essai ?',
          paragraphs: [
            'Nous avons transforme la strategie en sequence operationnelle : une quete visible, optionnelle, mais tres orientee vers les actions qui changent la conversion.',
            'Le principe etait simple : chaque etape devait produire un micro-gain concret pour l utilisateur et un signal d activation pour le produit.',
          ],
          explorations: {
            eyebrow: 'Explorations initiales',
            description: 'Avant d atterrir sur la version finale, plusieurs formats ont ete testes : challenge 30 jours, checklist classique, anneau circulaire, et variations d entree flottante. Le critere de selection etait la clarte d execution, pas l effet visuel.',
            chips: [
              'Variantes challenge 30 jours',
              'Anneau de progression circulaire',
              'Checklist compacte',
              'Variations du point d entree',
              'Liste de taches scrollable',
              'Version home + discover',
            ],
            gallery: [
              { image: '/projects/solenne-01.svg', caption: 'Variation 01 — hero ample, preuve trop tardive' },
              { image: '/projects/solenne-02.svg', caption: 'Variation 02 — preuve plus tot, lecture plus nette' },
            ],
          },
          solutionIntro: [
            'La solution retenue est une quete en 5 taches, visible sur Home, relayee par une entree flottante sur Discover, et totalement optionnelle pour ne pas bloquer les profils autonomes.',
            'Le design final privilegie la progression lisible : une liste courte, une progression visible, des cibles d action directes, et une celebration finale qui marque la completion.',
          ],
          interventions: [
            {
              code: 'TASK 01',
              title: 'Lire le guide NeoTaste',
              body: 'Le guide explique reservation, redemption et contexte en restaurant. Il supprime une part majeure de l incertitude au moment de la premiere offre.',
            },
            {
              code: 'TASK 02',
              title: 'Personnaliser les preferences alimentaires',
              body: 'La personnalisation augmente la pertinence des recommandations des les premiers jours, donc la probabilite de redemption rapide.',
            },
            {
              code: 'TASK 03',
              title: 'Sauvegarder des restaurants',
              body: 'Sauvegarder des lieux cree un premier investissement personnel dans l app et facilite les retours ulterieurs.',
            },
            {
              code: 'TASK 04',
              title: 'Trouver et utiliser les 2 premieres offres',
              body: 'C est le pivot business du projet : cette etape fait passer de la promesse a la preuve concrete de valeur.',
            },
            {
              code: 'TASK 05',
              title: 'Noter et laisser un avis',
              body: 'La boucle feedback renforce la valeur communautaire et consolide le sentiment de progression post-redemption.',
            },
          ],
          solutionGallery: [
            { image: '/projects/solenne-01.svg', caption: 'Hero + promesse resserree + CTA visible' },
            { image: '/projects/solenne-02.svg', caption: 'Lecture produit plus guidee, preuve plus rapide' },
            { image: '/projects/solenne-01.svg', caption: 'Bloc de preuve sociale reintegre dans la narration' },
            { image: '/projects/solenne-02.svg', caption: 'CTA final plus clair et moins dependant du scroll complet' },
          ],
          resource: {
            eyebrow: 'Flow complet',
            title: 'Prototype et parcours finalises',
            body: 'Une version haute fidelite a servi a valider la narration, les changements de rythme et la repartition exacte des preuves avant integration.',
            action: 'Voir la demo',
            href: 'https://example.com/solenne',
            image: '/projects/solenne-02.svg',
            caption: 'Vue d ensemble du prototype final et de la logique de progression entre les blocs.',
          },
          decisions: [
            {
              number: '01',
              title: 'Pourquoi 5 taches',
              body: '5 etait le point d equilibre entre couverture des actions cle et taux de completion acceptable.',
            },
            {
              number: '02',
              title: 'Debat sur la recompense',
              body: 'Un mois gratuit a ete ecarte pour eviter une logique transactionnelle. Le duo badge + celebration s est revele plus align e avec l objectif long terme.',
            },
            {
              number: '03',
              title: 'Levels system reconnecte',
              body: 'Le systeme de niveaux a ete aligne sur les actions a valeur (deals redeemed), avec des seuils lisibles et une progression non punitive.',
            },
            {
              number: '04',
              title: 'Quete optionnelle mais tres visible',
              body: 'Le point d entree sur Discover a ete decisif pour rendre une feature optionnelle effectivement adoptee.',
            },
          ],
          sideStories: [
            {
              label: 'Module secondaire 01',
              title: 'La preuve sociale condensee',
              description: 'Un bloc plus court, plus haut dans la page, pour rassurer plus tot sans allonger le parcours.',
              gallery: [
                { image: '/projects/solenne-01.svg', caption: 'Avant — preuve dispersee' },
                { image: '/projects/solenne-02.svg', caption: 'Apres — preuve regroupee et plus utile' },
              ],
            },
            {
              label: 'Module secondaire 02',
              title: 'Le systeme de CTA',
              description: 'Un ensemble de variantes plus strictes pour repeter la meme action sans saturer la page.',
              gallery: [
                { image: '/projects/solenne-02.svg', caption: 'CTA principal dans le hero' },
                { image: '/projects/solenne-01.svg', caption: 'Relance sobre apres les preuves' },
              ],
            },
          ],
          systemNote: {
            label: 'Mise a jour du systeme',
            description: 'La refonte a aussi servi a remettre a plat quelques regles de composition : contrastes, espacements, surfaces de cartes, variantes de CTA et comportement motion selon le viewport.',
            image: '/projects/solenne-01.svg',
            caption: 'Consolidation des tokens visuels et des composants utilises tout au long de la page.',
          },
          interactions: {
            label: 'Interactions',
            items: [
              'Food preferences : flow de selection',
              'Task progress bar animation',
              'Badge unlock : celebration de completion',
            ],
          },
          implementation: [
            {
              number: '01',
              title: 'A/B rollout',
              body: 'Lancement sur 25% des nouveaux utilisateurs, compare a un groupe controle sans quete.',
            },
            {
              number: '02',
              title: 'Design system updates',
              body: 'Ajout de nouveaux tokens pour les niveaux et celebrations afin de rendre le systeme evolutif.',
            },
            {
              number: '03',
              title: 'Calendrier',
              body: 'Environ 2 mois entre cadrage, design, arbitrages stakeholders, tests et livraison.',
            },
          ],
        },
        {
          number: '06',
          label: 'Metriques & KPIs',
          title: 'Deux paris. Les deux ont marche.',
          paragraphs: [
            'Le premier pari etait la conversion trial-to-paid. Le second etait l augmentation des actions a valeur pendant l essai.',
            'Apres 30 jours de test controle, les deux signaux ont evolue dans la bonne direction.',
          ],
          metrics: [
            { value: '+22%', label: 'Essais convertis en payant chez les utilisateurs de la quete' },
            { value: '~48%', label: 'Taux de completion de la quete (feature optionnelle)' },
            { value: '2x', label: 'Offres utilisees en M1 chez les completers vs non-completers' },
          ],
        },
        {
          number: '07',
          label: 'Conclusion',
          title: 'Guider tot.',
          paragraphs: [
            'Les utilisateurs n ont pas besoin de plus de fonctionnalites au debut. Ils ont besoin d un chemin clair vers la valeur.',
            'En guidant les bonnes actions au bon moment, la quete a transforme une intention d essai en comportement durable, sans imposer un parcours bloque.',
          ],
          lessons: [
            {
              number: '01',
              title: 'Achievement > remise financiere',
              body: 'Le badge et la progression ont mieux fonctionne qu une incentive monetaires trop transactionnelle.',
            },
            {
              number: '02',
              title: 'Optionnel ne veut pas dire invisible',
              body: 'Le placement de l entree quete est aussi important que la quete elle-meme.',
            },
            {
              number: '03',
              title: 'Les contraintes rendent les decisions meilleures',
              body: 'Forcer la priorisation des taches a produit une solution plus lisible et plus performante.',
            },
          ],
          next: [
            {
              number: '01',
              title: 'Approfondir les preuves contextuelles',
              body: 'Faire varier certains exemples et preuves selon la source de trafic ou le segment vise.',
            },
            {
              number: '02',
              title: 'Etendre le systeme aux pages filles',
              body: 'Appliquer la meme logique narrative aux pages use case et integration pour garder une lecture coherente dans tout le funnel.',
            },
            {
              number: '03',
              title: 'Tester des variantes de CTA selon la maturite',
              body: 'Adapter le discours du CTA entre visiteurs froids, traffic retargete et prospects deja engages.',
            },
          ],
        },
      ],
    },
  },
  {
    id: 'orbit-sessions-platform',
    client: 'Orbit Sessions',
    title: 'Donner a une plateforme culturelle un rythme de scene sans perdre en lisibilite.',
    description: 'Un systeme editorial pour des live sessions, pense pour laisser les images, le rythme et les transitions porter l\'atmosphere pendant que l\'architecture reste stable et reusable.',
    images: [
      '/projects/orbit-01.svg',
      '/projects/orbit-02.svg',
    ],
    tech: ['Vue Router', 'GSAP', 'ScrollTrigger', 'SCSS'],
    tags: ['Editorial', 'Scroll choregraphie'],
    metrics: [
      { value: '4.8m', label: 'Profondeur moyenne par visite' },
      { value: '+27%', label: 'Engagement sur les pages artistes' },
    ],
    link: 'https://example.com/orbit',
    year: '2025',
    role: 'Design d\'experience / Architecture frontend',
    accent: '#b8d8ff',
    statement: 'Une interface avec du tempo : des entrees volontaires, des pauses assumees et des transitions qui semblent composees plutot qu\'ajoutees.',
    results: ['Parcours editorial avec un vrai rythme', 'Modules reusables pour des recits de projet', 'Systeme d\'animation aligne avec la performance'],
  },
  {
    id: 'atelier-zero-system',
    client: 'Atelier Zero',
    title: 'Construire un systeme de portfolio qui reste sur mesure a chaque nouveau projet.',
    description: 'Une structure modulaire pour une pratique creative, melant layout contraste, donnees flexibles et choregraphie de page capable de grandir sans refonte.',
    images: [
      '/projects/atelier-01.svg',
      '/projects/atelier-02.svg',
    ],
    tech: ['Vue 3', 'GSAP', 'Lenis', 'SCSS', 'Vite'],
    tags: ['Systeme portfolio', 'Architecture de composants'],
    metrics: [
      { value: '0', label: 'Reecriture manuelle du layout pour publier' },
      { value: '<1h', label: 'Temps moyen pour mettre une etude en ligne' },
    ],
    link: 'https://example.com/atelier',
    year: '2024',
    role: 'Lead frontend / Direction motion',
    accent: '#f2f2f2',
    statement: 'Une structure portfolio concue pour rester elegante sous la pression du vrai contenu, pas seulement dans les maquettes.',
    results: ['Architecture projet reusable', 'Transitions partagees entre les routes', 'Workflow prive de publication conserve hors de la surface publique'],
    caseStudy: {
      intro: {
        before: 'Atelier Zero n etait pas un simple site vitrine, mais un systeme de publication vivant ou chaque nouveau projet devait entrer sans casser la coherence globale.',
        highlight: 'L objectif etait de concevoir un portfolio qui reste sur mesure meme quand le volume, les formats et les contraintes changent en permanence.',
        after: 'Ce cas raconte la construction complete du systeme, du diagnostic initial jusqu aux resultats concrets sur la vitesse de publication, la qualite visuelle et la maintenabilite.',
      },
      sections: [
        {
          number: '01',
          label: 'Contexte & probleme',
          title: 'Un portfolio qui paraissait premium en maquette, mais fragile en production.',
          paragraphs: [
            'Au debut, le portfolio reposait sur quelques pages tres soignees mais fortement coulees dans le marbre. Tant que le contenu restait proche des exemples d origine, le rendu paraissait impeccable. Des que les projets variaient en longueur, en ton ou en densite media, la qualite chutait rapidement.',
            'Le cout cache etait important : chaque nouvelle etude de cas declenchait des ajustements manuels de layout, des exceptions CSS, et des corrections de dernier moment. Ce qui devait etre un systeme devenait une succession de micro-refontes.',
            'Le probleme n etait pas esthetique uniquement. C etait un probleme de robustesse editoriale. Sans architecture claire, le design premium dependait du hasard des contenus au lieu d etre garanti par la structure.',
            'La mission a donc ete recadree de facon radicale : passer d un portfolio "beau quand tout est ideal" a un portfolio "fiable dans le reel", capable d absorber des projets imparfaits sans perdre sa tenue.',
          ],
          insight: {
            eyebrow: 'Diagnostic',
            title: 'La dette de publication venait surtout de la rigidite de structure, pas du manque de design.',
            items: [
              { value: 'N+1', label: 'exceptions layout ajoutees a chaque projet' },
              { value: 'Manual', label: 'retouches editoriales a repetition avant mise en ligne' },
              { value: 'Fragile', label: 'qualite visuelle dependante du contenu entrant' },
            ],
            note: 'Tant que la page detail etait monolithique, chaque variation de contenu creait un risque de rupture.',
          },
        },
        {
          number: '02',
          label: 'Hypothese de travail',
          title: 'Traiter le portfolio comme un produit, pas comme une galerie statique.',
          paragraphs: [
            'L hypothese directrice etait la suivante : si on transforme la page projet en systeme narratif compose de blocs reutilisables, alors chaque etude de cas peut rester singuliere sans casser la coherence d ensemble.',
            'Autrement dit, il fallait decoupler deux couches souvent melangees : la couche de style (typographie, rythme, transitions, surfaces) et la couche de contenu (histoire, preuves, decisions, resultats).',
            'En separant ces couches via un schema de donnees explicite, on pouvait garantir trois choses en meme temps : une vraie identite visuelle, une vitesse de publication stable et une maintenance beaucoup plus predicible.',
          ],
          callout: {
            eyebrow: 'Hypothese',
            title: 'Un schema de case study riche + des composants editoriaux robustes = qualite visuelle stable meme sous contrainte.',
            note: 'La question n etait plus "comment designer une page" mais "comment designer une machine a produire des pages premium".',
          },
        },
        {
          number: '03',
          label: 'Recherche & decomposition',
          title: 'Cartographier ce qui casse, puis isoler les invariants du recit.',
          workstreams: [
            {
              title: 'Autopsie des anciennes pages',
              body: 'Inventaire des zones de casse recurrentes : hero trop dependant du titre, blocs preuve mal alignes, variations media non prevues, et transitions incoherentes.',
            },
            {
              title: 'Analyse des patterns editoriaux',
              body: 'Extraction des invariants narratifs observes dans les meilleures case studies : contexte, probleme, hypothese, decisions, impact, apprentissages.',
            },
            {
              title: 'Design du schema de donnees',
              body: 'Definition d un objet `caseStudy` extensible permettant d exprimer un recit long sans multiplier les ifs et les exceptions dans le template.',
            },
          ],
          paragraphs: [
            'Cette phase a pose une regle fondatrice : chaque section devait etre lisible seule, mais aussi participer a un rythme global du haut vers le bas.',
            'Le schema final n a pas ete pense comme une simple liste de champs. Il a ete pense comme une grammaire editoriale : quels types de preuve peuvent apparaitre, dans quel ordre, avec quelle hierarchie typographique.',
            'Le benefice immediat a ete la disparition des patchs opportunistes. Au lieu de bricoler section par section, on a introduit des primitives stables qui absorbent les cas reels.',
          ],
          media: {
            eyebrow: 'Schema & structure',
            image: '/projects/atelier-01.svg',
            caption: 'Passage d une page unique rigide a une composition sectionnelle gouvernee par donnees.',
          },
        },
        {
          number: '04',
          label: 'Architecture solution',
          title: 'Construire une page longue comme un systeme de sections orchestrables.',
          paragraphs: [
            'La refonte a introduit une architecture en deux etages : un renderer Vue pour les blocs editoriaux, et un contrat de donnees qui decide quoi afficher et comment prioriser le recit.',
            'Chaque section a ete rendue autonome : callout, workstreams, galeries, cartes numerotees, metriques, lessons, next steps. L auteur peut ainsi narrer en profondeur sans revenir toucher au code de layout.',
            'Le style global a ete adapte pour soutenir cette profondeur : rails, cartes denses, titres display, respirations strictes, et comportement responsive qui preserve la lisibilite sur tablette/mobile.',
            'Le resultat n est pas une seule page "atelier". C est un moteur de page projet, capable de produire des recits longs, lisibles, et coherents sur des cas tres differents.',
          ],
        },
        {
          number: '05',
          label: 'Processus de conception',
          title: 'Du prototype de blocs a la narration complete, etape par etape.',
          question: 'Comment raconter un projet en profondeur sans perdre le lecteur ni epuiser l equipe de publication ?',
          paragraphs: [
            'Le processus a suivi un principe simple : prototyper d abord la structure narrative, puis seulement ensuite la couche visuelle detaillee. Cela a evite de confondre effet graphique et clarte du recit.',
            'Des versions intermediaires ont ete testees avec differents niveaux de densite textuelle pour trouver le point d equilibre entre profondeur documentaire et rythme de lecture.',
          ],
          explorations: {
            eyebrow: 'Iterations',
            description: 'Plusieurs formats ont ete compares : page ultra-condensee, version article tres longue, variante en timeline stricte, puis version hybride en sections numerotees. La version retenue combine densite, repere visuel et modularite.',
            chips: [
              'Version courte orientee vitrine',
              'Version longue type whitepaper',
              'Narration en timeline continue',
              'Sections numerotees modulaires',
              'Cartes metriques + decisions',
              'Blocs lessons et next steps',
            ],
            gallery: [
              { image: '/projects/atelier-01.svg', caption: 'Prototype A — recit trop compact pour les cas complexes' },
              { image: '/projects/atelier-02.svg', caption: 'Prototype B — recit modulaire avec meilleure progression' },
            ],
          },
          solutionIntro: [
            'La solution finale conserve une lecture claire meme avec beaucoup de texte : index visible, sections semantiquement distinctes, et blocs de preuve qui rythment la lecture.',
            'L auteur peut raconter une histoire "dictionnaire" sans transformer la page en mur de texte, car chaque type de contenu trouve une forme adaptee.',
          ],
          interventions: [
            {
              code: '01',
              title: 'Index narratif numerote',
              body: 'Installation d un squelette 01-07 pour donner un repere cognitif constant au lecteur sur les pages longues.',
            },
            {
              code: '02',
              title: 'Blocs de preuve multi-formats',
              body: 'Ajout de cartes pour signaux, decisions, workstreams et metriques afin de casser la monotonie du texte continu.',
            },
            {
              code: '03',
              title: 'Schema `caseStudy` extensible',
              body: 'Conception d une grammaire de donnees qui permet d allonger le recit sans augmenter la complexite du composant.',
            },
            {
              code: '04',
              title: 'Fallback intelligent pour les projets courts',
              body: 'Conservation du mode compact historique pour les projets qui n ont pas encore de case study longue.',
            },
            {
              code: '05',
              title: 'Rendu responsive robuste',
              body: 'Recomposition des grilles a chaque breakpoint pour garder la lisibilite, y compris dans la largeur reduite du panneau VS Code.',
            },
          ],
          decisions: [
            {
              number: '01',
              title: 'Pourquoi garder 7 sections cœur',
              body: 'Ce format couvre le cycle complet d une histoire produit sans noyer le lecteur dans une taxonomie infinie.',
            },
            {
              number: '02',
              title: 'Pourquoi un schema data plutot qu un CMS externe',
              body: 'Le besoin prioritaire etait la maitrise fine du rendu et de la vitesse iteration. Le schema local permettait de stabiliser avant d externaliser.',
            },
            {
              number: '03',
              title: 'Pourquoi des animations sobres',
              body: 'Sur une page longue, l animation doit soutenir la concentration. Trop d effets degrade la comprehension et fatigue la lecture.',
            },
            {
              number: '04',
              title: 'Pourquoi maintenir une route privee de publication',
              body: 'Le flux prive protege le rythme de travail : enrichir, tester, publier sans exposer les brouillons a la surface publique.',
            },
          ],
          implementation: [
            {
              number: '01',
              title: 'Refactor data model',
              body: 'Ajout de la structure `caseStudy` dans les donnees projet avec normalisation des blocs narratifs.',
            },
            {
              number: '02',
              title: 'Refactor renderer projet',
              body: 'Reconstruction de la vue detail pour mapper dynamiquement les blocs et conserver un fallback compact.',
            },
            {
              number: '03',
              title: 'Passes QA',
              body: 'Verification de build, checks responsive, validation en navigateur local et stabilisation des cas limites de contenus longs.',
            },
          ],
        },
        {
          number: '06',
          label: 'Resultats & apports',
          title: 'Des gains operationnels aussi importants que le gain visuel.',
          paragraphs: [
            'Le premier resultat a ete une baisse immediate du travail manuel de finition avant publication. Les nouveaux projets ne demandaient plus de chirurgie layout a chaque livraison.',
            'Le deuxieme resultat a ete qualitatif : la page detail est devenue un outil de narration strategique, pas seulement une galerie de captures.',
            'Le troisieme resultat, souvent sous-estime, a ete la serenite de maintenance : le systeme accepte mieux les contenus imparfaits et evolue sans regressions majeures.',
          ],
          metrics: [
            { value: '0', label: 'reecriture manuelle de layout pour publier un nouveau cas' },
            { value: '<1h', label: 'temps moyen pour mettre une etude complete en ligne' },
            { value: 'Stable', label: 'coherence visuelle maintenue sur contenus heterogenes' },
          ],
        },
        {
          number: '07',
          label: 'Conclusion & suites',
          title: 'Un portfolio robuste est d abord une architecture de narration.',
          paragraphs: [
            'Ce projet confirme une idee simple : la qualite premium durable ne vient pas d une page heroique, mais d un systeme qui supporte la realite de publication dans le temps.',
            'En transformant la page projet en moteur editorial, Atelier Zero a gagne en vitesse, en clarte et en fiabilite. Le design ne depend plus d un cas ideal, il devient reproductible.',
            'La suite logique est d etendre cette grammaire : plus de types de preuves, plus de variantes media, et un outillage auteur encore plus confortable dans le flux prive.',
          ],
          lessons: [
            {
              number: '01',
              title: 'Designer le systeme avant la page',
              body: 'Les interfaces qui tiennent dans le temps sont celles ou les regles de composition sont explicites et testees sur des cas non-ideaux.',
            },
            {
              number: '02',
              title: 'La narration est une infrastructure',
              body: 'Un bon schema editorial reduit la dette produit autant qu une bonne architecture technique.',
            },
            {
              number: '03',
              title: 'La maintenabilite est un critere de design',
              body: 'Un rendu spectaculaire qui casse a chaque publication coute plus cher qu un systeme sobre mais robuste.',
            },
          ],
          next: [
            {
              number: '01',
              title: 'Bibliotheque de blocs avancee',
              body: 'Ajouter des modules compares, timelines et annexes techniques pour les cas les plus analytiques.',
            },
            {
              number: '02',
              title: 'Assistants de redaction dans le flux prive',
              body: 'Outiller la preparation narrative (structure, longueur cible, coherence tonale) avant publication.',
            },
            {
              number: '03',
              title: 'Systeme de versionning des etudes',
              body: 'Historiser les evolutions de chaque case study pour documenter les impacts sur la duree.',
            },
          ],
        },
      ],
    },
  },
]
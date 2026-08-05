# Tailles typographiques hors barème

Inventaire complet des tailles qui ne figurent pas dans l'échelle définie
dans `tokens.css` (10 · 11 · 13 · 14 · 16 · 17 · 19 · 22 px).

**86 occurrences**, et non 68 : mon premier comptage ne couvrait que 9/12/15px
et ignorait le haut de l'échelle.

Rien n'est appliqué. Chaque groupe est indépendant et peut être validé seul.

---

## Synthèse

| Taille | × | Correction proposée | Écart | Risque |
|---|---|---|---|---|
| 9px | 4 | `--text-micro (10px)` | +1px | Négligeable |
| 12px | 43 | `--text-label (13px)` | +1px | Faible |
| 15px | 21 | `--text-body (14px)` | -1px | Faible |
| 18px | 1 | `--text-title (19px)` | +1px | Négligeable |
| 20px | 8 | `--text-display (22px)` | +2px | MOYEN |
| 24px | 1 | `--text-display (22px)` | -2px | À arbitrer |
| 26px · 64px | 2 | *aucune* | — | — |
| 32 · 34 · 40px | 6 | nouveau palier chiffres | — | À décider |

---

## Cas particuliers

### Emojis — à exclure du barème (26px, 64px)
`AvatarPickerSheet:86` et `ProfileScreen:195` dimensionnent un emoji, pas du
texte. Un barème typographique n'a pas à les régir : je propose de les laisser.

### Grands chiffres — il manque un palier (32px ×3, 34px ×2, 40px ×1)
Le barème s'arrête à 22px, or l'app affiche six chiffres de mise en avant :

- `screens/analytics/AnalyticsScreen.tsx:28` — 32px
- `screens/profile/DisciplineCard.tsx:52` — 32px
- `screens/profile/ProfileScreen.tsx:312` — 32px
- `components/ProgressRings.tsx:35` — 34px
- `screens/home/HomeScreen.tsx:58` — 34px
- `screens/analytics/AnalyticsScreen.tsx:232` — 40px

Ce n'est pas une dérive mais un manque : ces chiffres n'ont aucun token.
Deux valeurs pour un même rôle (32 et 34) restent toutefois arbitraires.
Proposition : `--text-figure: 32px` et `--text-figure-lg: 40px`, en ramenant
34 → 32. À valider séparément, c'est un ajout au système, pas une correction.

---

## Détail par groupe

### 9px → `--text-micro (10px)`  (+1px, risque : Négligeable)

En-têtes de colonnes des micro-champs.

**micro-champ** (2)

- `screens/planning/FreeSessionSheet.tsx:26`
- `screens/planning/RoutineEditorSheet.tsx:50`

**texte courant** (1)

- `screens/profile/ProfileScreen.tsx:278`

**champ de saisie** (1)

- `screens/profile/ProfileScreen.tsx:293`

### 12px → `--text-label (13px)`  (+1px, risque : Faible)

Messages d'erreur, états vides, libellés de section. Textes courts et centrés, aucun conteneur à largeur fixe.

**texte courant** (22)

- `screens/analytics/AnalyticsScreen.tsx:107`
- `screens/analytics/AnalyticsScreen.tsx:135`
- `screens/analytics/AnalyticsScreen.tsx:206`
- `screens/home/QuickEntrySheet.tsx:21`
- `screens/home/StepsSheet.tsx:43`
- `screens/onboarding/AccountStep.tsx:90`
- `screens/onboarding/ExperienceStep.tsx:60`
- `screens/onboarding/ExperienceStep.tsx:96`
- `screens/onboarding/PhysicalProfileStep.tsx:58`
- `screens/onboarding/PhysicalProfileStep.tsx:135`
- `screens/onboarding/UsernameStep.tsx:126`
- `screens/planning/CustomExerciseSheet.tsx:21`
- `screens/planning/ExerciseInfoSheet.tsx:116`
- `screens/planning/ExercisePickerSheet.tsx:69`
- `screens/planning/ExercisePickerSheet.tsx:73`
- `screens/planning/FreeSessionSheet.tsx:18`
- `screens/planning/RoutineEditorSheet.tsx:42`
- `screens/planning/RoutineEditorSheet.tsx:57`
- `screens/profile/BiometricsSheet.tsx:83`
- `screens/profile/IndicatorsSheet.tsx:77`
- `screens/profile/ProfileScreen.tsx:315`
- `screens/workout/WorkoutScreen.tsx:238`

**message d'erreur** (17)

- `screens/auth/LoginStep.tsx:110`
- `screens/auth/ResetPasswordScreen.tsx:137`
- `screens/home/QuickEntrySheet.tsx:113`
- `screens/home/StepsSheet.tsx:75`
- `screens/onboarding/AccountStep.tsx:117`
- `screens/onboarding/ExperienceStep.tsx:91`
- `screens/planning/CustomExerciseSheet.tsx:194`
- `screens/planning/ExerciseInfoSheet.tsx:108`
- `screens/planning/ExercisePickerSheet.tsx:82`
- `screens/planning/RoutineEditorSheet.tsx:329`
- `screens/planning/RoutineEditorSheet.tsx:335`
- `screens/profile/AccountEditSheet.tsx:193`
- `screens/profile/AccountEditSheet.tsx:196`
- `screens/profile/AvatarPickerSheet.tsx:179`
- `screens/profile/BiometricsSheet.tsx:55`
- `screens/profile/IndicatorsSheet.tsx:49`
- `screens/workout/WorkoutScreen.tsx:156`

**état vide** (3)

- `screens/analytics/AnalyticsScreen.tsx:112`
- `screens/planning/FreeSessionSheet.tsx:167`
- `screens/planning/PlanningScreen.tsx:611`

**libellé de bouton** (1)

- `screens/profile/ProfileScreen.tsx:256`

### 15px → `--text-body (14px)`  (-1px, risque : Faible)

Libellés de boutons principaux et texte des champs. Les boutons font 52px de haut, le texte rétrécit sans contrainte.

**texte courant** (20)

- `components/SetRow.tsx:48`
- `screens/auth/ForgotPasswordStep.tsx:72`
- `screens/auth/LoginStep.tsx:96`
- `screens/auth/ResetPasswordScreen.tsx:150`
- `screens/home/QuickEntrySheet.tsx:13`
- `screens/home/QuickEntrySheet.tsx:126`
- `screens/home/StepsSheet.tsx:66`
- `screens/home/StepsSheet.tsx:88`
- `screens/onboarding/AccountStep.tsx:137`
- `screens/onboarding/ExperienceStep.tsx:77`
- `screens/onboarding/PhysicalProfileStep.tsx:18`
- `screens/onboarding/UsernameStep.tsx:139`
- `screens/planning/CustomExerciseSheet.tsx:207`
- `screens/planning/ExercisePickerSheet.tsx:68`
- `screens/planning/FreeSessionSheet.tsx:288`
- `screens/planning/RoutineEditorSheet.tsx:410`
- `screens/profile/AccountEditSheet.tsx:209`
- `screens/profile/BiometricsSheet.tsx:66`
- `screens/profile/IndicatorsSheet.tsx:60`
- `screens/profile/ProfileScreen.tsx:227`

**champ de saisie** (1)

- `screens/planning/RoutineEditorSheet.tsx:176`

### 18px → `--text-title (19px)`  (+1px, risque : Négligeable)

Occurrence isolée.

**texte courant** (1)

- `screens/profile/AvatarPickerSheet.tsx:115`

### 20px → `--text-display (22px)`  (+2px, risque : MOYEN)

Titres des écrans auth/onboarding. Les écrans principaux titrent déjà en 22px : c'est l'incohérence de fond. Mais +2px sur 8 titres peut provoquer des retours à la ligne sur petit écran.

**titre d'écran** (8)

- `screens/auth/ForgotPasswordStep.tsx:48`
- `screens/auth/ResetPasswordScreen.tsx:66`
- `screens/auth/ResetPasswordScreen.tsx:83`
- `screens/auth/ResetPasswordScreen.tsx:102`
- `screens/onboarding/AccountStep.tsx:60`
- `screens/onboarding/ExperienceStep.tsx:36`
- `screens/onboarding/PhysicalProfileStep.tsx:51`
- `screens/onboarding/UsernameStep.tsx:68`

### 24px → `--text-display (22px)`  (-2px, risque : À arbitrer)

Compte à rebours de la barre de repos. C'est l'élément focal d'une barre flottante : le réduire est un choix d'emphase, pas de barème.

**texte courant** (1)

- `components/RestTimerBar.tsx:84`

---

## Ordre d'application conseillé

1. **9px, 18px** — 5 occurrences, aucun risque.
2. **12px** — 43 occurrences, écart d'1px sur des textes secondaires courts.
3. **15px** — 21 occurrences, boutons et champs, écart d'1px vers le bas.
4. **20px** — à regarder à l'écran d'abord : c'est le seul groupe qui peut
   provoquer un retour à la ligne, sur 8 titres d'écran.
5. **24px, grands chiffres** — décisions d'emphase, pas de barème.

Les groupes 1 à 3 (69 occurrences) sont mécaniques. Le 4 mérite une capture
avant/après. Le 5 est une question de design, pas de cohérence.

> Aucun test ne couvre les tailles : contrairement aux graisses, une taille
> hors barème n'est pas une faute en soi. Un garde-fou équivalent à
> `typography.test.ts` n'aurait de sens qu'une fois ces choix arrêtés.

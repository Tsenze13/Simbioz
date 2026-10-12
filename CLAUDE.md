# Симбиоз — инструкция для работы с проектом

Браузерный рогалик (Canvas 2D, чистый JS, без библиотек). Весь интерфейс и тексты на русском.
Игрок — автор игры, общается по-русски, часто голосом (опечатки распознавания нормальны).

## Главные правила
- **Код правится только в `src/`.** `index.html` — результат сборки, руками его не трогать.
- После правок: `python3 build.py`, затем `python3 tests/smoke.py`. Коммитить только при «ИТОГ: всё в порядке».
- Новую механику — сразу покрыть проверкой в `tests/smoke.py`.
- Версия игры: строка `Версия X.Y` в `src/shell/body.html`. Поднимать при каждой выдаче игроку.
- Коммит = одна версия/одна логическая правка, сообщение на русском: `Симбиоз vX.Y: что изменилось`.
- `index.html` в корне коммитится всегда собранным: его раздаёт GitHub Pages → https://tsenze13.github.io/Simbioz/
- **Бета и лаборатория.** Крупные визуальные правки сначала идут в ветку `beta-sprites` (версия «X.Y-бета»).
  Сборка беты копируется в `beta/index.html` на main → https://tsenze13.github.io/Simbioz/beta/ ,
  варианты спрайтов на выбор — `lab/sprites.html` на main. После одобрения игроком бета сливается в main.
- Старые версии — в истории git (коммиты «Симбиоз v0.15.1 … v0.22»), отдельными файлами их не хранить.

## Сборка
`src/manifest.txt` — порядок склейки файлов. Весь JS из `src/js/**` попадает внутрь одной
IIFE с `'use strict'` (открывается в `src/js/core/prelude.js`, закрывается в `src/js/core/loop.js`),
поэтому функции и константы общие для всех файлов. Порядок важен для `const` верхнего уровня,
функции поднимаются (hoisting). Новый файл — добавить в manifest на нужное место.

## Карта кода (src/)
| Файл | Что внутри |
|---|---|
| shell/*.html, styles/game.css | разметка, стили, обёртка `<script>` |
| portraits/portraits.js | отдельный скрипт: живые портреты героев (`PORTRAIT.draw`) |
| js/core/prelude.js | хелперы `$`, `TAU`, `rnd`, `clamp`, `pickOf`, `WAVES_TOTAL` |
| js/data/balance.js | **`BAL` — все числа баланса**: опыт, рост врагов, защита боссов, волны, лавка, уровни ульты |
| js/data/heroes.js | стихии `EL`, классы `CLS`, рост `GROW`, `HST`, пассивки `HPAS`, `HMECH`, иконки `GL` |
| js/data/skills.js | навыки `AB` через `def(...)`, ульты `ULT` |
| js/data/enemies.js | враги `ET`, боссы `BOSS` (pats/p2 — списки приёмов) |
| js/data/items.js | предметы `ITEMS` через `it(...)`, торговцы `MERCH`, вложения `INVEST` |
| js/data/meta.js | мета-прокачка `META`, статы карточек `STC`, клавиши `ACTIONS/DEFKEYS` |
| js/data/relics.js | реликвии боссов `RELICS`, сложность `ASC` + `ascMod()`, события `EVTS`, комбо предметов `SYN` |
| js/core/save.js, state.js | сохранение `SAVE` (+ hints/tut, asc/ascSel, mus, fps), звук `sfx`, `needFor` |
| js/core/music.js | `MUS` — генеративная музыка по карте/боссу, громкость `SAVE.mus` |
| js/world/maps.js | биомы `MAPS`, чанки, ловушки карт `hazards`, прилив воды |
| js/world/chapters.js | **главы** `CHAP` (6 × [старт, путь А, путь Б, логово] + боссы), варианты карт `vmap` (поле `bio` = биом), «волна сложности» `effW/SW()`, `chapHp/chapDm`, здоровье боссов `bossHpScale`, безопасная зона `openSafeZone`, порталы |
| js/core/stats.js | `recalc()` (все статы игрока), `tickBuffs`, эффекты |
| js/combat/damage.js | `OUT_MODS` (множители урона), `bossDefense`, учёт урона `dmgBy`/`tagNew`, `hitEnemy`, `applySt`, `killEnemy`, `explodeAt`, `shoot` |
| js/combat/cast.js | `CAST.*` — типы способностей |
| js/combat/trees.js | древа мутаций `TREE`, хуки `HK`, `castSlot`, `useItem` |
| js/combat/ults.js | `ULTFN`, печати мастерства `MSEAL` (у мастеров, хранятся в `g.ult.ms`), печати Аватара — `g.ult.seals` |
| js/combat/weapons.js | автоатаки стихий, стволы металла, гранаты |
| js/combat/forms.js | формы мастеров `FORMS` (линии Очаги/Течения/Глыбы/…): `fire(f,l,t,m)`, `formsTick`, `drawForms`; карточки form/formmod |
| js/combat/player_side.js | снаряды, зоны, столкновения |
| js/enemies/ai.js | `hurtPlayer`, ИИ врагов, `bossPattern`, `bossDodge`, `bossAI`, `updEnemies` |
| js/enemies/waves.js | спавн, волны (`startWave`, `endWave`) |
| js/game/bag.js, leveling.js | рюкзак/покупки, опыт `gainXp`, карточки `buildChoices/applyChoice` |
| js/game/flow.js | рывок, движение, `heroMech`, `itemFx`, `update(dt)`, волны `waveLogic`, старт/конец забега |
| js/game/runextras.js | выбор реликвий, комбо (`synUpdate`, `synTip`), события между волнами (`spawnEvents`, `useEvent`, `drawEvents`) |
| js/ui/*.js | HUD, подсказки новичку `tut()`, окно уровня, древо, лавка, пауза и итоги (`dmgRows`), меню (сложность `ascRow`), ввод |
| js/render/*.js | спрайты навыков `SP`, снаряды, стволы (`GUNS`, `GMOD`), торговцы `MS`, враги `ENS`, герои `HTD`, карта, `render()` |
| js/render/guns_art.js | `GUNART` — спрайты оружия Солдата (пистолет…снайперка, граната), подменяют `SP.pistol` и др. |
| js/render/jet.js | струя огнемёта `drawJet`, стена огня `drawWalls`, смерчи, дожди/град, огненные кометы |
| js/core/loop.js | игровой цикл, отладочные хуки `window.__sb`, `window.__x` |

## Отладка
Хуки включаются `localStorage['simbioz-debug']='1'`. `window.__sb` даёт `G`, `startRun`, `startWave`,
`update(dt)`, `render`, `castSlot`, `spawnEnemy`, `bossPattern` и т.д. — их использует `tests/smoke.py`.
Ошибки в отложенных вызовах `g.later` копятся в `window.__le`.

## Герои (с v0.28, дизайн — docs/design-heroes.md)
6 **мастеров** (`g.start` = стихия) берут только свою стихию до 8 ур. 7-й герой **Аватар**: `g.start==='avatar'`,
смешивает до 3 стихий (каждая до 4), учит симбиозы. Хелперы: `isAva(g)`, `elCap(k)`, `hEl(k)` (цвет/имя героя,
вместо `EL[g.start]`), `HEROK` (список героев для меню). Тело Аватара — спрайт Мистика (`heroBody`) + гало стихий.
Механики конкретного героя проверяются как `g.start==='fire'` — для Аватара они сами выключены.

## Главы (с 0.36-беты, дизайн — docs/design-chapters.md)
Забег = одна глава (`g.ch`): 3 карты по `WPM`=12 волн, `WAVES_TOTAL`=36. `g.wave` — сквозной номер волны;
`mapStage(w)`/`mapWave(w)` — карта и волна на ней. Рост врагов, ловушек и цен идёт по «волне сложности» `SW()`,
а не по `g.wave` — новую формулу с номером волны пиши через `SW()`. Карта главы — вариант биома: проверки врагов
по карте, сродство героя `AFF` и музыка — через `bio(g.map)`. После босса карты: `g.safe` (фаза 'inter' без таймера),
`g.portals`, вход — `interact()` → `usePortal`. `g.risk` — «Тропа испытаний».

## Прокачка (с v0.23)
Три пути: **уровень → карточки**, **очки навыков → древо** (навыки, мутации, пассивка, ульта и её печати),
**золото → лавка**. Отдельных очков ульты нет: уровни ульты открываются с уровня героя `BAL.hero.ultLvReq`.

## Удерживаемые навыки и автоприменение
`kind:'channel'` (огнемёт): `castSlot` → `chanStart`, каждые 0,09 с `chanTick` вызывает `CAST.channel`, мана `mana` в секунду,
откат после отпускания. Держит: клавиша (`codes`), палец/мышь на слоте (`g.chanPtr`) или автоприменение.
Автоприменение: `s.auto` (Alt+клавиша, правый клик по слоту), `autoTick` кастует с `g.autoAim` (прицел в ближайшего).

## Учёт урона
Навык при касте ставит `g.curSk`, новые снаряды/зоны/взрывы помечаются `sk` (`tagNew`), циклы в
player_side.js выставляют `g.curSk` от сущности. Новая механика урона героя — укажи `sk` или служебную метку из `DMG_LBL`.

## Подводные камни
- `ENS`, `SP`, `MS`, `HTD` — константы в общей области, проверять `typeof ENS!=='undefined'`, не `window.ENS`.
- `addPatch` — опасная для ИГРОКА лужа; для зон игрока — `addZone`.
- Таймер атаки босса `e.bt`, не использовать его для других целей (был баг спама атак).
- Урон по боссу ограничен (≤5% за удар, троттлинг, барьер на фазах) — учитывать при балансе.

# ファイル同士の依存(自動生成: node tools/deps.js --update)

各ファイルが使っている「他のファイルで宣言された名前」。新しく増えた依存はコミットの差分で確認する(不要な依存を作らない)。
00-core(G など共通の土台)と 20-upgrades(BAL/atk など)への依存は省略。

## 20-upgrades.js
- 25-ui.js: refresh
- 75-audio.js: beep

## 21-pacing.js
- 70-show.js: banner
- 85-pachifx.js: ykLv
- 99-main.js: T

## 23-upgrades2.js
- 96r-relic.js: relicBonus

## 25-ui.js
- 26-dots.js: UX
- 30-battle.js: isBoss
- 90-extra.js: QL

## 27-cabinet.js
- 26-dots.js: UX
- 40-pachinko.js: balls
- 75-audio.js: AC, tone
- 99-main.js: run

## 28-settings.js
- 25-ui.js: flash
- 26-dots.js: UX
- 75-audio.js: getVol, setVol, BG, AC

## 29-push.js
- 25-ui.js: flash, shake
- 75-audio.js: AC, tone, beep
- 77-se.js: kyuin

## 29b-upicons.js
- 26-dots.js: UX

## 29c-menugrp.js
- 91-meta.js: FM, fxTab, fxMenu, fxShow
- 98g-party.js: fmgMark

## 30-battle.js
- 21-pacing.js: LU
- 23-upgrades2.js: UPX
- 25-ui.js: showMsg, flash, shake
- 70-show.js: banner
- 75-audio.js: beep
- 77-se.js: kyuin, fan
- 85-pachifx.js: mini
- 90-extra.js: zoom, HS
- 94-prestige.js: presLater
- 99-main.js: T

## 35-battle-draw.js
- 10-sprites.js: SPR, enSpr, spw, BOSSN
- 26-dots.js: S
- 30-battle.js: HA, isBoss, PR, PT
- 36-battle-bg.js: drawBgB, modeBack, modeFront
- 80-skillfx.js: fxEo, fxWave, camB, drawFX, jpShow
- 81-pxfont.js: pxText, drawF, drawCmb
- 82-hitfx.js: drawHitFx, drawDeath
- 83-cutin.js: drawCut
- 84-charfx.js: heroDY
- 84b-atkfx.js: heroDX
- 85-pachifx.js: drawRes
- 89c-layer.js: lyNameX

## 36-battle-bg.js
- 30-battle.js: isBoss
- 80-skillfx.js: lines
- 81-pxfont.js: pxW, pxText

## 40-pachinko.js
- 21-pacing.js: spAdd, hitRoll, heatYk
- 30-battle.js: hurt
- 50-slot.js: startSpin
- 70-show.js: banner
- 75-audio.js: beep, AC, tone
- 77-se.js: kyuin, jara
- 90-extra.js: awaken, CB, golden, QL
- 99-main.js: run

## 45-pachinko-draw.js
- 40-pachinko.js: pegs
- 46-board-fx.js: boardBack, centerWin, pegFx, pocketFx, ballsFx, boardFront
- 81-pxfont.js: PXRDY, pxText

## 46-board-fx.js
- 40-pachinko.js: pegs, onChucker, onAtk, onSide, balls
- 45-pachinko-draw.js: discSpr, BUMPL_
- 70-show.js: bigHit
- 81-pxfont.js: pxText
- 90-extra.js: CB, QL
- 99-main.js: T

## 50-slot.js
- 25-ui.js: showMsg, flash, shake
- 26-dots.js: reelShow
- 70-show.js: banner, bigHit
- 75-audio.js: beep
- 77-se.js: kyuin
- 85-pachifx.js: res
- 90-extra.js: QL

## 60-roulette.js
- 25-ui.js: showMsg, flash, shake
- 30-battle.js: hurt, burst, F
- 50-slot.js: startSpin
- 70-show.js: banner
- 75-audio.js: beep
- 77-se.js: kyuin, jara
- 79-se2.js: seRoulResult
- 86-gekiatsu.js: thickTxt
- 99-main.js: T

## 70-show.js
- 25-ui.js: showMsg, flash, shake
- 30-battle.js: cutin, hurt, F
- 75-audio.js: beep
- 77-se.js: kyuin
- 87-hitev.js: hitEvent

## 76-bgm.js
- 29-push.js: PUSH
- 30-battle.js: isBoss
- 75-audio.js: sVo, sNs, SND, SGR, BG, bgNewBus, AC, sndResume, sGr, sndUnlock

## 77-se.js
- 25-ui.js: flash
- 75-audio.js: AC, SND, sPri, sGr, tone, noise, sDuck
- 79-se2.js: sTb, sePipo, seJaraStream
- 99-main.js: last

## 78-sehooks.js
- 29-push.js: pushPrompt, PUSH
- 30-battle.js: isBoss
- 75-audio.js: AC, SND
- 77-se.js: seBoss, seKill, seCrit, seHit, seWin, seJackpot, seCombo, sePend, seCut, seAwaken, seGold, seSpin ほか7
- 79-se2.js: seBossDown, seReachStage, seReelTick, seDoubleWin, seDoubleLose, seAori, seDecide, seRoulTick, seRoulResult, seGen
- 85-pachifx.js: MG
- 95-minigames.js: MG2

## 79-se2.js
- 36-battle-bg.js: L
- 75-audio.js: SND, AC, sVok, sVo, sGr, noise, tone, sDuck
- 77-se.js: sOK, sNow, sBig, fanRoot

## 79-songs.js
- 76-bgm.js: SONGS, SCJ, SCD, SCP, bgPrep

## 79b-bonus.js
- 75-audio.js: sVo, noise, tone, sDuck
- 76-bgm.js: SONGS, bgPrep, SRANK, bgStep, bgmState, bgBand
- 77-se.js: sOK, sNow, fanRoot, sBig, sLad
- 79-se2.js: seJaraStream, sePipo, sRise
- 98e-bonustime.js: BT, BTK

## 79c-hypese.js
- 75-audio.js: AC, SGR, bgGain, applyMix, tone, noise
- 77-se.js: sOK, sNow

## 79c-titlebgm.js
- 75-audio.js: sVo, sGr, SND, sNs, AC, sndResume, BG, bgNewBus
- 76-bgm.js: SONGS, SCJ, bgPrep, SRANK, bgStep, CTY, bgmState, bgm

## 80-skillfx.js
- 30-battle.js: FX, PT
- 36-battle-bg.js: L
- 81-pxfont.js: pxW, pxText
- 99-main.js: T

## 81-pxfont.js
- 30-battle.js: F
- 45-pachinko-draw.js: buildBg
- 80-skillfx.js: pop

## 82-hitfx.js
- 10-sprites.js: SPR, PXL, enSpr
- 25-ui.js: flash
- 30-battle.js: kill, isBoss, hurt
- 81-pxfont.js: COINI
- 99-main.js: T

## 83-cutin.js
- 10-sprites.js: SPR

## 84-charfx.js
- 10-sprites.js: SPR
- 30-battle.js: kill, isBoss, spawn
- 35-battle-draw.js: drawB
- 36-battle-bg.js: L
- 70-show.js: bigHit
- 83-cutin.js: drawCut
- 83b-portrait.js: PIMGI, PIMGF, PIMGRim, PORT, PORTRim
- 86-gekiatsu.js: gkPick
- 91-meta.js: X
- 96r-relic.js: RDR
- 99-main.js: T, run, update

## 84b-atkfx.js
- 30-battle.js: heroAtk
- 35-battle-draw.js: drawB
- 60-roulette.js: hy0
- 75-audio.js: tone
- 77-se.js: sOK, sNow
- 84-charfx.js: heroDY
- 99-main.js: T

## 85-pachifx.js
- 25-ui.js: flash
- 36-battle-bg.js: modeB, MC
- 75-audio.js: beep
- 77-se.js: kyuin
- 99-main.js: T

## 86-gekiatsu.js
- 25-ui.js: showMsg, flash, shake
- 26-dots.js: reelShow
- 30-battle.js: kill
- 35-battle-draw.js: drawB
- 50-slot.js: startSpin, updSpin
- 70-show.js: banner, bigHit
- 75-audio.js: tone, noise
- 77-se.js: sOK, sNow, seReelStop, kyuin, seSpin, jara
- 99-main.js: T, update

## 87-hitev.js
- 23-upgrades2.js: UPX
- 25-ui.js: showMsg, shake, flash
- 26-dots.js: UX
- 29-push.js: pushPrompt
- 30-battle.js: hurt, burst
- 35-battle-draw.js: drawB
- 50-slot.js: startSpin
- 60-roulette.js: startRoul, WS, SG, WCH, wBuild
- 70-show.js: banner, jackpot
- 75-audio.js: tone
- 77-se.js: sOK, sNow, kyuin, fan, jara
- 79-se2.js: seRoulResult
- 86-gekiatsu.js: thickTxt, gkPick
- 99-main.js: T, update

## 87b-jpfx.js
- 25-ui.js: shake
- 29-push.js: pushPrompt, PUSH
- 45-pachinko-draw.js: drawP
- 70-show.js: jackpot
- 75-audio.js: tone
- 77-se.js: sOK, sNow, jara, kyuin
- 80-skillfx.js: pop
- 84-charfx.js: chJumpAll, chSayAll
- 86-gekiatsu.js: thickTxt
- 99-main.js: T, update

## 87d-roulquick.js
- 60-roulette.js: updRoul, startRoul

## 88-bannerfx.js
- 70-show.js: banner

## 89-horyu.js
- 25-ui.js: showMsg, shake
- 40-pachinko.js: onChucker
- 46-board-fx.js: pRing
- 50-slot.js: startSpin
- 70-show.js: banner
- 75-audio.js: beep
- 77-se.js: kyuin
- 79-se2.js: sePipo
- 90-extra.js: QL
- 99-main.js: T, update

## 89c-layer.js
- 26-dots.js: UX
- 29-push.js: PUSH
- 35-battle-draw.js: drawB
- 45-pachinko-draw.js: drawP
- 60-roulette.js: roulSuper
- 70-show.js: banner
- 80-skillfx.js: FXRM
- 81-pxfont.js: drawCmb
- 84-charfx.js: chDrawSB
- 85-pachifx.js: mini
- 86-gekiatsu.js: GK, gkDraw
- 87-hitev.js: HEV, mrDraw
- 87b-jpfx.js: JPX
- 90-extra.js: HS
- 94-prestige.js: PGEN
- 98e-bonustime.js: btDraw
- 99-main.js: T, run, update

## 89d-blackout.js
- 25-ui.js: showMsg
- 26-dots.js: UX
- 35-battle-draw.js: drawB
- 50-slot.js: startSpin
- 79c-hypese.js: hyDuck, seHy
- 80-skillfx.js: FXRM
- 86-gekiatsu.js: thickTxt
- 94-prestige.js: PGEN
- 99-main.js: T, update

## 89d-title.js
- 10-sprites.js: PXL, SPR, spw
- 26-dots.js: S, rows
- 75-audio.js: AC, BG, SND, setMute
- 79c-titlebgm.js: ttBgmStart, ttBgmGo
- 91-meta.js: X

## 89e-bigslot.js
- 25-ui.js: showMsg, shake
- 26-dots.js: reelShow, UX
- 79c-hypese.js: seHy
- 89d-blackout.js: hyLite, hyLay, hyTxt, HYD
- 94-prestige.js: presLater, PGEN
- 99-main.js: T, update

## 89f-ultjp.js
- 10-sprites.js: SPR
- 25-ui.js: showMsg, shake
- 28-settings.js: close
- 30-battle.js: burst
- 35-battle-draw.js: drawB
- 70-show.js: jackpot
- 79c-hypese.js: seHy
- 84-charfx.js: cutChar
- 86-gekiatsu.js: thickTxt
- 87-hitev.js: jpRush, HEV
- 89c-layer.js: lyBig, lyBusyB, lyImpact, lyStop
- 89d-blackout.js: hyLite
- 94-prestige.js: PGEN
- 99-main.js: T, update

## 89g-btnfx.js
- 29-push.js: pushPrompt, PUSH, pushPress
- 79c-hypese.js: seHy
- 94-prestige.js: presLater
- 98b-active.js: cbShow, cbPress, ACT
- 99-main.js: T

## 89h-pushhype.js
- 29-push.js: pushPrompt, PUSH, pushPress
- 30-battle.js: burst
- 75-audio.js: tone, noise
- 77-se.js: sOK, sNow
- 94-prestige.js: presLater

## 90-extra.js
- 25-ui.js: shake
- 30-battle.js: hurt, F, burst
- 70-show.js: banner
- 75-audio.js: AC, tone
- 77-se.js: kyuin, fan

## 91-meta.js
- 29c-menugrp.js: fmgMenu
- 92-offline.js: offlineCheck, OFFD
- 94-prestige.js: SB
- 99-main.js: run

## 92-offline.js
- 25-ui.js: flash
- 75-audio.js: beep
- 77-se.js: fan, kyuin
- 91-meta.js: fnum, X, nowMs, MAXAWAY, fxOpen, addGold, saveX, fxShow, fxClose, FU, fxSet
- 94-prestige.js: SB

## 92b-daily.js
- 29d-resicon.js: resAmt
- 77-se.js: kyuin, jara
- 91-meta.js: fxShow, fxClose, fxOpen
- 96s-smith.js: RES
- 99-main.js: update, run

## 93-achieve.js
- 29d-resicon.js: resAmt
- 30-battle.js: kill, isBoss
- 70-show.js: bigHit
- 75-audio.js: beep, AC
- 91-meta.js: X, addGold, fxToast, saveX, FU, FM
- 94-prestige.js: SB

## 93b-mission.js
- 29d-resicon.js: resIcon
- 30-battle.js: kill, isBoss, ult
- 70-show.js: banner, bigHit
- 75-audio.js: tone
- 77-se.js: sOK, sNow, kyuin
- 85-pachifx.js: MG
- 86-gekiatsu.js: GK
- 91-meta.js: fxToast, fxMenu, FM
- 92b-daily.js: dailyToday
- 95-minigames.js: MG2
- 96s-smith.js: RES
- 98b-active.js: actTap, ACT, actCatch
- 99-main.js: update

## 94-prestige.js
- 23-upgrades2.js: soulHarv, upCapSet, upCapExt
- 25-ui.js: refresh, shake
- 26-dots.js: RS
- 29-push.js: PUSH
- 30-battle.js: hurt, PR, spawn
- 40-pachinko.js: balls
- 70-show.js: banner
- 77-se.js: kyuin, fan
- 85-pachifx.js: MG
- 86-gekiatsu.js: GK
- 87-hitev.js: HEV
- 87b-jpfx.js: JPX
- 90-extra.js: HS, QL
- 91-meta.js: X, fxToast, fxShow, fxMenu, fxClose, saveX, FM
- 93-achieve.js: achCheck
- 94b-soul.js: soulTotal, sbShow
- 95-minigames.js: MG2, mg2End
- 98b-active.js: ACT, cbHide
- 98f-hilo.js: HL

## 94b-soul.js
- 25-ui.js: refresh
- 30-battle.js: spawn
- 77-se.js: kyuin
- 91-meta.js: X, fxToast, saveX, nowMs, FU, FM
- 94-prestige.js: soulGain, PRES_MIN, presDo, SB
- 98c-upgroups.js: grpRefresh
- 99-main.js: T, run

## 94c-herohp.js
- 10-sprites.js: SPR, spw
- 25-ui.js: refresh, showMsg
- 26-dots.js: UX
- 30-battle.js: isBoss, heroAtk, hurt, spawn
- 35-battle-draw.js: drawHeroes, drawB
- 70-show.js: banner
- 75-audio.js: beep, tone
- 77-se.js: sOK, sNow
- 82-hitfx.js: ringFx
- 84-charfx.js: heroDY
- 84b-atkfx.js: heroDX
- 91-meta.js: X, fxToast, FU
- 94-prestige.js: SB, presDo
- 94b-soul.js: soulLv, SOUL
- 98z-tower.js: TW, twEnd
- 99-main.js: T, run

## 95-minigames.js
- 10-sprites.js: SPR
- 25-ui.js: flash
- 75-audio.js: beep
- 77-se.js: kyuin
- 85-pachifx.js: mini, MG, stopMG
- 91-meta.js: fxEl, X, addGold, FU, FM
- 93-achieve.js: sbg

## 96-allies.js
- 10-sprites.js: SPR
- 25-ui.js: shake
- 30-battle.js: hurt, burst
- 35-battle-draw.js: drawB
- 70-show.js: banner
- 75-audio.js: AC, beep
- 77-se.js: fan
- 91-meta.js: addGold, X, FU, fxToast, FM
- 93-achieve.js: sbg, AC_
- 94c-herohp.js: HV, hvMax
- 99-main.js: T

## 96b-zukan.js
- 10-sprites.js: BOSSN, enSpr
- 30-battle.js: kill
- 75-audio.js: tone
- 77-se.js: sOK, sNow
- 91-meta.js: fxToast, FM
- 94-prestige.js: SB

## 96r-relic.js
- 21-pacing.js: spAdd
- 30-battle.js: isBoss, kill
- 35-battle-draw.js: drawB
- 70-show.js: bigHit, banner
- 75-audio.js: tone
- 77-se.js: kyuin, sOK, sNow
- 85-pachifx.js: MG
- 86-gekiatsu.js: thickTxt
- 91-meta.js: FM
- 94-prestige.js: SB
- 94b-soul.js: relicDropP
- 95-minigames.js: MG2
- 99-main.js: run, T, update

## 96s-smith.js
- 10-sprites.js: enSpr
- 29d-resicon.js: resIcon, resIconCanvas
- 30-battle.js: heroAtk, PR, kill, isBoss
- 35-battle-draw.js: drawB
- 70-show.js: jackpot, banner
- 77-se.js: kyuin
- 84-charfx.js: chJump
- 86-gekiatsu.js: GK, thickTxt
- 91-meta.js: fxToast, FM
- 94-prestige.js: SB
- 96b-zukan.js: zkStar, ZK
- 98b-active.js: actCatch
- 98c-upgroups.js: grpRefresh
- 99-main.js: T, run, update

## 96t-kuji.js
- 10-sprites.js: SPR
- 29d-resicon.js: resIcon
- 70-show.js: banner
- 75-audio.js: tone
- 77-se.js: sOK, sNow, kyuin
- 91-meta.js: fxToast, fxShow, FM
- 96s-smith.js: RES, WPN

## 97-app.js
- 26-dots.js: UX

## 97-monet.js
- 25-ui.js: showMsg
- 70-show.js: banner

## 97s-support.js
- 70-show.js: banner
- 77-se.js: kyuin, jara
- 84-charfx.js: chJumpAll, chSay
- 85-pachifx.js: MQP
- 91-meta.js: fxToast, fxClose, FM
- 96s-smith.js: RES
- 97-monet.js: monNative, MON
- 97t-rank.js: RK
- 98b-active.js: CF
- 99-main.js: T

## 97t-rank.js
- 86-gekiatsu.js: GK
- 91-meta.js: X, fxToast, fxMenu, FM
- 99-main.js: T, update

## 97u-app.js
- 30-battle.js: kill, isBoss
- 70-show.js: bigHit, jackpot
- 99-main.js: T

## 97v-ios.js
- 45-pachinko-draw.js: buildBg
- 60-roulette.js: WCH
- 75-audio.js: AC, sndResume

## 97w-save.js
- 29c-menugrp.js: FMGRP
- 91-meta.js: X, fxShow, fxMenu, FU, fxToast, FM
- 97u-app.js: appSend, UAPP
- 99-main.js: T, run

## 98-mgfx.js
- 10-sprites.js: SPR
- 26-dots.js: UX
- 85-pachifx.js: MG, updMG
- 86-gekiatsu.js: thickTxt
- 91-meta.js: FU
- 95-minigames.js: MG2, mg2c
- 99-main.js: T

## 98b-active.js
- 10-sprites.js: SPR
- 21-pacing.js: spAdd
- 23-upgrades2.js: UPX
- 25-ui.js: shake, showMsg, flash
- 30-battle.js: hurt, burst, spawn, isBoss, kill
- 35-battle-draw.js: drawB
- 36-battle-bg.js: L
- 70-show.js: banner
- 75-audio.js: tone
- 77-se.js: sOK, sNow, kyuin, fan, jara
- 86-gekiatsu.js: gkPick, thickTxt
- 90-extra.js: HS
- 91-meta.js: fxEl
- 94-prestige.js: presLater
- 99-main.js: run, T, update

## 98c-upgroups.js
- 91-meta.js: FM, fxOpen, fxMenu
- 99-main.js: update

## 98d-expedition.js
- 25-ui.js: shake, flash
- 29d-resicon.js: resIcon
- 70-show.js: banner
- 77-se.js: kyuin, fan
- 79b-bonus.js: seExp
- 91-meta.js: X, nowMs, fxToast, fxOpen, fxMenu, fxShow, FU, FM
- 93-achieve.js: AC_
- 96r-relic.js: relicRoll
- 96s-smith.js: RES
- 98g-party.js: ptDepart, ptBonus, ptRelicLow, ptReturn, ptHtml, ptMenu, ptAffTag

## 98e-bonustime.js
- 25-ui.js: showMsg
- 35-battle-draw.js: drawB
- 70-show.js: banner
- 77-se.js: kyuin, fan
- 79b-bonus.js: seBt
- 85-pachifx.js: MG
- 86-gekiatsu.js: thickTxt
- 91-meta.js: fxToast, FM
- 93-achieve.js: AC_
- 94-prestige.js: SB
- 95-minigames.js: MG2
- 96s-smith.js: resMs
- 98f-hilo.js: HL
- 99-main.js: T, run, update

## 98f-hilo.js
- 10-sprites.js: SPR
- 25-ui.js: flash
- 70-show.js: banner
- 77-se.js: kyuin, fan
- 79b-bonus.js: seHl
- 85-pachifx.js: mini
- 91-meta.js: addGold, X, FU
- 93-achieve.js: sbg
- 95-minigames.js: MGT, mg2e, mg2Start, mg2c
- 96r-relic.js: relicUpd, RDR
- 98-mgfx.js: mgTxt, mgHue
- 99-main.js: T

## 98g-party.js
- 10-sprites.js: SPR
- 29c-menugrp.js: FMGRP
- 29d-resicon.js: resIcon
- 70-show.js: banner
- 75-audio.js: beep, AC
- 91-meta.js: X, fxOpen, fxMenu, FU, FM, fxToast
- 93-achieve.js: AC_
- 96r-relic.js: RLD, RLMAX, relicSave
- 96s-smith.js: RES
- 98d-expedition.js: EXP, EXD, expMs, expDone

## 98h-area.js
- 10-sprites.js: SPR, PXL, enSpr, BOSSN
- 30-battle.js: isBoss, kill
- 35-battle-draw.js: drawEnemy, drawHP, drawB
- 36-battle-bg.js: drawBgB
- 75-audio.js: tone
- 77-se.js: sOK, sNow
- 81-pxfont.js: pxText
- 82-hitfx.js: ringFx, deathFx
- 86-gekiatsu.js: thickTxt
- 90-extra.js: HS
- 96b-zukan.js: ZKN, ZKK, ZK
- 99-main.js: run, T, update

## 98i-altar.js
- 27-cabinet.js: sheet
- 29d-resicon.js: resIcon, resAmt
- 91-meta.js: X, FM, fxClose, FB
- 94-prestige.js: soulGain, presGainShow, presSbaShow, SB, presInfo, PRES_MIN, presAsk, presDo
- 94b-soul.js: relicDropP, soulNext, soulFree, SOULD, soulLv, SOUL
- 96s-smith.js: RES
- 98c-upgroups.js: UPG, grpSet, grpRefresh

## 98i-gemshop.js
- 21-pacing.js: hitRoll, DRY
- 25-ui.js: showMsg
- 26-dots.js: S
- 29c-menugrp.js: FMGRP
- 29d-resicon.js: resIcon
- 35-battle-draw.js: drawB
- 45-pachinko-draw.js: discSpr
- 46-board-fx.js: BALL_
- 70-show.js: banner
- 77-se.js: kyuin
- 81-pxfont.js: pxText, pxW, pxShade
- 91-meta.js: fxToast, fxOpen, fxMenu, FM
- 93-achieve.js: AC_
- 93b-mission.js: msToday, MS, msGoal, msCheckDay, MSD, msSave
- 94-prestige.js: SB
- 94b-soul.js: soulLv, soulAutoTick
- 96s-smith.js: RES, resMs, resT
- 98d-expedition.js: EXP, expLeft, expSave, expGo, EXD, expFmt
- 98e-bonustime.js: BT, btStart, btBusy
- 99-main.js: update, run

## 98j-expbtn.js
- 26-dots.js: UX
- 91-meta.js: FM, fxTab, fxMenu, FU
- 98d-expedition.js: EXP, expOpen, expDone, expLeft

## 98k-upmove.js
- 91-meta.js: FM, fxClose, fxOpen
- 98c-upgroups.js: UPG, grpRefresh, sheetOpen, grpSet
- 98i-gemshop.js: gsRe

## 98l-edition.js
- 01-edition.js: FREE_MAX, IS_FULL
- 29c-menugrp.js: FMGRP
- 30-battle.js: kill, spawn
- 91-meta.js: fxShow, fxToast, FM
- 94-prestige.js: presLater
- 97s-support.js: BOOTH_URL
- 98s-story.js: styQueue, TS

## 98m-heroup.js
- 10-sprites.js: SPR
- 29d-resicon.js: resIcon
- 91-meta.js: fxToast
- 94c-herohp.js: hvMax, HV, hvGenki, HUPD, hupOpen, HUP, hupCost, hupIcon, hvSurv, HVSAFE, hupBuy
- 98c-upgroups.js: grpRefresh, UPG
- 98i-altar.js: altOpen
- 98s-story.js: STH

## 98n-skin.js
- 10-sprites.js: HGRP, SPR, PXL, SPW
- 29d-resicon.js: resIcon
- 70-show.js: banner
- 77-se.js: fan
- 84-charfx.js: chJumpAll
- 91-meta.js: X, fxToast, FU
- 94c-herohp.js: HVDK
- 96s-smith.js: RES
- 98c-upgroups.js: grpRefresh, UPG
- 98m-heroup.js: HUPF
- 98s-story.js: STH
- 98yb-lancer.js: lnOn
- 99-main.js: run

## 98o-goals.js
- 21-pacing.js: spAdd
- 29c-menugrp.js: FMGRP
- 70-show.js: banner
- 77-se.js: kyuin, fan
- 84-charfx.js: chJumpAll
- 91-meta.js: fxToast, fxOpen, fxMenu, FU, X, FM
- 92b-daily.js: dailyToday
- 93-achieve.js: AC_
- 94-prestige.js: SB
- 96-allies.js: ALY
- 96s-smith.js: resMs
- 98h-area.js: AREAS
- 98n-skin.js: SKD, skHas, skName
- 98y-finale.js: END
- 98yb-lancer.js: lnOn
- 98z-tower.js: TW
- 99-main.js: run

## 98p-pause.js
- 98s-story.js: STY, styUpd
- 98t-tutorial.js: TUT, tutUpd
- 98y-finale.js: END, endUpd

## 98s-story.js
- 10-sprites.js: SPR
- 29-push.js: PUSH
- 30-battle.js: kill, isBoss
- 83b-portrait.js: PIMGI, PIMGF, PORT
- 85-pachifx.js: MG
- 89c-layer.js: lyBig, lyBusyB
- 91-meta.js: X, fxOpen, fxMenu, fxClose
- 98h-area.js: AREAS, AR
- 98t-tutorial.js: TUT
- 99-main.js: run, T, update

## 98t-tutorial.js
- 10-sprites.js: SPR
- 29-push.js: PUSH
- 29c-menugrp.js: FMGRP
- 30-battle.js: isBoss
- 89c-layer.js: lyBig
- 91-meta.js: FM, X, fxOpen, fxClose, fxToast, fxMenu
- 98s-story.js: TS, TS_NEW, tsSave, STY, STH
- 99-main.js: run, update

## 98y-finale.js(完全版のみ)
- 10-sprites.js: SPR
- 29d-resicon.js: resIcon
- 75-audio.js: tone
- 76-bgm.js: bgmState, SONGS
- 77-se.js: sOK, sNow
- 91-meta.js: FU, fxToast
- 93-achieve.js: AC_
- 96s-smith.js: resGem
- 98h-area.js: AREAS
- 98p-pause.js: pzOn
- 98s-story.js: SCN, TS, styQueue, STY, styBusy
- 99-main.js: run, T

## 98ya-music.js(完全版のみ)
- 29c-menugrp.js: FMGRP
- 76-bgm.js: SONGS, bgmState
- 91-meta.js: X, fxToast, fxOpen, fxMenu, FM

## 98yb-lancer.js(完全版のみ)
- 10-sprites.js: mkH3, SPR
- 25-ui.js: refresh
- 29d-resicon.js: resIcon
- 30-battle.js: isBoss, hurt, cutin
- 35-battle-draw.js: drawHeroes
- 70-show.js: banner
- 75-audio.js: beep, tone
- 77-se.js: sOK, sNow, fan
- 84-charfx.js: CUTL, chSay
- 91-meta.js: X, fxToast, FU
- 93-achieve.js: AC_
- 94-prestige.js: PGEN
- 94b-soul.js: soulLv, SOUL
- 94c-herohp.js: hvBossK, HV
- 98c-upgroups.js: grpRefresh, UPG
- 98m-heroup.js: hupFace
- 98n-skin.js: skAdd, SKGEM
- 98s-story.js: STH, TS, styQueue, STY, SCN, scnOf
- 98y-finale.js: END
- 98z-tower.js: TW
- 99-main.js: T, run

## 98yc-shell.js(完全版のみ)
- 70-show.js: banner
- 75-audio.js: beep
- 77-se.js: kyuin
- 79b-bonus.js: seHl
- 85-pachifx.js: mini
- 91-meta.js: addGold, X, FU
- 93-achieve.js: sbg
- 94-prestige.js: PGEN
- 95-minigames.js: MGT, mg2e, mg2Start, mg2c
- 98-mgfx.js: mgTxt
- 99-main.js: T

## 98z-tower.js(完全版のみ)
- 10-sprites.js: enSpr
- 29-push.js: PUSH
- 29c-menugrp.js: FMGRP
- 30-battle.js: spawn, kill
- 35-battle-draw.js: drawEnemy, drawHP, drawB
- 36-battle-bg.js: drawBgB
- 70-show.js: banner
- 75-audio.js: tone
- 77-se.js: sOK, sNow, kyuin
- 81-pxfont.js: pxText
- 82-hitfx.js: deathFx, ringFx
- 89c-layer.js: lyBusyB
- 91-meta.js: X, fxToast, fxOpen, fxClose, fxShow, FU, FM
- 93-achieve.js: AC_
- 94-prestige.js: SB
- 96s-smith.js: resMs, resGem, RI
- 99-main.js: run, T

## 99-main.js
- 21-pacing.js: spAdd, ultReady
- 25-ui.js: showMsg, refresh
- 29-push.js: PUSH
- 30-battle.js: PR, hurt, burst, heroAtk, ult, spawn
- 35-battle-draw.js: drawB
- 40-pachinko.js: balls, stepBalls
- 45-pachinko-draw.js: drawP
- 50-slot.js: updSpin, startSpin
- 60-roulette.js: updRoul
- 70-show.js: banner
- 75-audio.js: AC, beep
- 76-bgm.js: bgm
- 77-se.js: kyuin, fan
- 85-pachifx.js: updMG, drawMq
- 89d-title.js: ttGo
- 90-extra.js: HS
- 91-meta.js: featUpdate, featStart
- 98p-pause.js: pzStep


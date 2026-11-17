# 태오랑 태이랑 · Learning with Theo and Tay

A tablet web app (PWA) for 태이 to learn to read Korean, with a place for 태오's math later.
Built for a Galaxy Tab S10+ in landscape. Progress is saved on the tablet only.

## What's inside
- **Entry:** 태이 (한글) and 태오 (수학, coming soon). The grown-ups area opens by holding "어른용" for 2 seconds.
- **태이's map:** 9 planets (units), from 가나다 to batchim, family words and short sentences.
- **Activities:** meet a new block, listen & pick, find the same letter, build a block (자음 + 모음 + 받침), put syllables/words in order, finger tracing, and reading aloud (mic, Korean speech recognition).
- **Adaptive engine** (`js/engine.js`): a mastery score per syllable/word, spaced review, mix-up drills for pairs he confuses, easier choices when he struggles, and units that unlock at 80% mastery.
- **Rewards:** coins, a sticker book (과일·공룡·가족·우주, each sticker is a word to read), and 망고's clothes shop.
- **Grown-ups:** progress, mix-ups, his read-aloud recordings, voice setting, **progress report export** (give the file to Claude to improve the curriculum), backup and restore.

## Audio
`audio/<voice>/manifest.json` maps each spoken text to an mp3 in the same folder. Anything without a clip is spoken by the tablet's Korean text-to-speech.

## Updating the curriculum
World 1 ("망고 섬") teaches reading through picture words: chapters of 4 decodable words (간식 시간, 동물 친구), each split into short stages. Pictures are in `assets/img/`, picture sounds in `assets/sfx/`.
Units live in `js/curriculum.js`; the rules (lesson length, unlock threshold, review timing) are `RULES` in `js/engine.js`. After changing files, bump `VERSION` in `sw.js` so the tablet picks up the update.

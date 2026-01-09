# Changelog

## [1.5.0](https://github.com/ShadyDonkey/torkin-bot/compare/v1.4.0...v1.5.0) (2026-01-09)


### Features

* add Dockerfile and production setup ([#57](https://github.com/ShadyDonkey/torkin-bot/issues/57)) ([9b4117a](https://github.com/ShadyDonkey/torkin-bot/commit/9b4117ae5ca77f0a7f4c3cfaf398e13e69c11861))
* add example environment configuration file ([be64e01](https://github.com/ShadyDonkey/torkin-bot/commit/be64e018c5168a838bdcf1cbb6fef4b0765f7278))
* add generic help command ([dfae347](https://github.com/ShadyDonkey/torkin-bot/commit/dfae347b5280203efa08ea0911347744a45fa02d))
* add initial watchlist addition ([05cebd0](https://github.com/ShadyDonkey/torkin-bot/commit/05cebd07605c830fabd8f49626cb5e4fd6089218))
* add language support in detail responses ([#47](https://github.com/ShadyDonkey/torkin-bot/issues/47)) ([dcf595d](https://github.com/ShadyDonkey/torkin-bot/commit/dcf595de1f895a98dad7a155666f2c4caad489e0))
* add optional opencode review ([eb69b11](https://github.com/ShadyDonkey/torkin-bot/commit/eb69b111bce1931cbc02b211404fa5419396ccc0))
* add provider logo script to upload emojis to Discord ([#44](https://github.com/ShadyDonkey/torkin-bot/issues/44)) ([28b0a7c](https://github.com/ShadyDonkey/torkin-bot/commit/28b0a7cc28a3b987bb9b5482c44c10a5c6ef61b6))
* add recommendations ([#51](https://github.com/ShadyDonkey/torkin-bot/issues/51)) ([363c364](https://github.com/ShadyDonkey/torkin-bot/commit/363c364d0005cdef153b681b9188cd2add18eada))
* add tracking ([#84](https://github.com/ShadyDonkey/torkin-bot/issues/84)) ([2b74e1a](https://github.com/ShadyDonkey/torkin-bot/commit/2b74e1ae022afb5d6bc4d6b16c345aea748f2bb4))
* add user settings ([#46](https://github.com/ShadyDonkey/torkin-bot/issues/46)) ([f1fe975](https://github.com/ShadyDonkey/torkin-bot/commit/f1fe975c8c71744c2bc41b29921c70bf8be03b14))
* add watchlist basic navigation ([72f77f7](https://github.com/ShadyDonkey/torkin-bot/commit/72f77f74ef61f380a4bf0f12f82df0ce618b9799))
* add webhook handling for Discord events ([#79](https://github.com/ShadyDonkey/torkin-bot/issues/79)) ([34a91e4](https://github.com/ShadyDonkey/torkin-bot/commit/34a91e44635221e3a50d1b2910db2cda64e710c2))
* **admin:** add install commands ([5ad5e05](https://github.com/ShadyDonkey/torkin-bot/commit/5ad5e05655f2a588ebcad081eaf8787c1cb180a5))
* **auth:** add better-auth base ([#63](https://github.com/ShadyDonkey/torkin-bot/issues/63)) ([3448dc4](https://github.com/ShadyDonkey/torkin-bot/commit/3448dc4907159b3612946495a69d7a894abbc5f9))
* **authn:** ensure user owns the interaction ([15e2eda](https://github.com/ShadyDonkey/torkin-bot/commit/15e2edab8b34b284a45d2934bafc3f012afbf05c))
* **cache:** add trending movies and genres caching logic ([e908e9f](https://github.com/ShadyDonkey/torkin-bot/commit/e908e9f91bf2512f66f3d7fe1dae68d30fd68b64))
* **components:** user check ([#27](https://github.com/ShadyDonkey/torkin-bot/issues/27)) ([97074da](https://github.com/ShadyDonkey/torkin-bot/commit/97074dab0c475973ce0546a5ef98a38396755062))
* dedupe provider text for details ([29ea4ae](https://github.com/ShadyDonkey/torkin-bot/commit/29ea4ae60c53d9a6941d6b9fca7309c428a4a18a))
* error page ([4bfe57c](https://github.com/ShadyDonkey/torkin-bot/commit/4bfe57c28905be49124e00c143ecc23ef32d7f20))
* **find:** refactor movie and TV detail handling ([6bd27ff](https://github.com/ShadyDonkey/torkin-bot/commit/6bd27ff6a99c5ad1a8426cba1ab8ce7831cd6c63))
* include updateResponse fn in interaction object ([#3](https://github.com/ShadyDonkey/torkin-bot/issues/3)) ([2f745e1](https://github.com/ShadyDonkey/torkin-bot/commit/2f745e1a4374dca5b3a8ef5c2baafaecb07b512c))
* initial website ([#56](https://github.com/ShadyDonkey/torkin-bot/issues/56)) ([7185b6b](https://github.com/ShadyDonkey/torkin-bot/commit/7185b6b5743247c428e31268accd62c3f8e0bb43))
* **jobs:** add provider scheduled jobs ([#37](https://github.com/ShadyDonkey/torkin-bot/issues/37)) ([a9e1d1c](https://github.com/ShadyDonkey/torkin-bot/commit/a9e1d1c942b9c76754e488efcd01bdbb17d75d0b))
* **jobs:** add trending scheduled jobs ([#31](https://github.com/ShadyDonkey/torkin-bot/issues/31)) ([6f22ff5](https://github.com/ShadyDonkey/torkin-bot/commit/6f22ff5570f1c9729fda291d0615c1afa181c6c3))
* **listing:** add trailers and IMDb links ([557c512](https://github.com/ShadyDonkey/torkin-bot/commit/557c5126d8917d960955c6e4711999ba06281272))
* **logging:** added pino and pino-loki ([#25](https://github.com/ShadyDonkey/torkin-bot/issues/25)) ([e62cc78](https://github.com/ShadyDonkey/torkin-bot/commit/e62cc7806abd4143dc375cbfca9beb6fe4470b86))
* **pagination:** add result pagination and update search functionality ([2fd7a63](https://github.com/ShadyDonkey/torkin-bot/commit/2fd7a634d47f7fa10c1350ac9b2c0d32c5527d27))
* **pagination:** implement paginateArray utility function ([70faa3f](https://github.com/ShadyDonkey/torkin-bot/commit/70faa3fc761521356bc3c63faf79a034f2632a85))
* **paginations:** details back buttons reserve page ([#4](https://github.com/ShadyDonkey/torkin-bot/issues/4)) ([5d85a63](https://github.com/ShadyDonkey/torkin-bot/commit/5d85a63d6fba415710c65d924d4b64f759a0ffd6))
* **pagination:** separate remote IDs for movies and series ([991a36d](https://github.com/ShadyDonkey/torkin-bot/commit/991a36db2cfcc59dec16063232e36a555d691234))
* **pagination:** update pagination button label to show current page ([fc94676](https://github.com/ShadyDonkey/torkin-bot/commit/fc94676573458c4bdd36d98b72fd688cfaa0b0cc))
* **providers:** user preferences ([#66](https://github.com/ShadyDonkey/torkin-bot/issues/66)) ([c754d1a](https://github.com/ShadyDonkey/torkin-bot/commit/c754d1aee3ca775f768948beb8bd14aac2312541))
* **response:** add updateResponse utility for interaction handling ([1717cc3](https://github.com/ShadyDonkey/torkin-bot/commit/1717cc33c39628a9e140025b9c173445d5383587))
* resume and trigger jobs on startup ([#74](https://github.com/ShadyDonkey/torkin-bot/issues/74)) ([6fc855d](https://github.com/ShadyDonkey/torkin-bot/commit/6fc855dfe012df09ae78644807418e89ca3ba1d7))
* switch to TSS and different approach to setup ([#64](https://github.com/ShadyDonkey/torkin-bot/issues/64)) ([fdf793f](https://github.com/ShadyDonkey/torkin-bot/commit/fdf793f22bb324703e5b2971a69c58967749c5a8))
* **trending:** add pagination and view details buttons for trending content ([41fec7f](https://github.com/ShadyDonkey/torkin-bot/commit/41fec7f1cde961d4f8424f3e6b1ce55db77ec8bf))
* **trending:** add trending movies and TV shows command ([a633351](https://github.com/ShadyDonkey/torkin-bot/commit/a633351709741b366fa3925a09ab0719cf03393d))
* **trending:** refactor period options for movie and TV subcommands ([f3867cb](https://github.com/ShadyDonkey/torkin-bot/commit/f3867cb7aa8b8d29a00c84a75ceeffe0c2e44109))
* **utilities:** add slugify function ([1fca8f6](https://github.com/ShadyDonkey/torkin-bot/commit/1fca8f63a063e872c5fb00a9e3738caf06b3bbb8))
* **view-details:** add view details interaction handler ([1d8684f](https://github.com/ShadyDonkey/torkin-bot/commit/1d8684fb3cee58578c39edd39a3127975740745a))
* **watchlist:** add default watchlist if no previous one exists ([0925bc7](https://github.com/ShadyDonkey/torkin-bot/commit/0925bc72e80d4f8b2408b4e06f554d5e73c67a8d))
* **watchlist:** implement initial watchlist creation and management commands ([f01f9db](https://github.com/ShadyDonkey/torkin-bot/commit/f01f9db15ae137edaed3f96a32866e4437c4f02e))
* **watchlist:** update navigation and do all the item details ([b69474a](https://github.com/ShadyDonkey/torkin-bot/commit/b69474aae0bee841892596b908f8d95354e5f177))


### Bug Fixes

* add block braces, lint rule, and ensure safe returns across codebase ([#33](https://github.com/ShadyDonkey/torkin-bot/issues/33)) ([f9d83b4](https://github.com/ShadyDonkey/torkin-bot/commit/f9d83b46666c4692af26fde14c0fb782755bb9bc))
* add std serializers to handle proper error serialization ([d607f32](https://github.com/ShadyDonkey/torkin-bot/commit/d607f32051d8abf3d6e14ad09614bca272ed142b))
* change ids for watchlists ([1e89bef](https://github.com/ShadyDonkey/torkin-bot/commit/1e89befcfc547275d907495c7aeeeb55eaf874a7))
* correct import path for paginateSearch utility ([ff6c3f2](https://github.com/ShadyDonkey/torkin-bot/commit/ff6c3f249c287f325fbc0fd55b8f7b2d05ca7dac))
* correct import path for paginateSearch utility ([7656bca](https://github.com/ShadyDonkey/torkin-bot/commit/7656bca937103943d2cb31a6af95a0141700dec0))
* create user preferences if not existing ([#72](https://github.com/ShadyDonkey/torkin-bot/issues/72)) ([cd9a9a7](https://github.com/ShadyDonkey/torkin-bot/commit/cd9a9a7a2751c3b289d96eba5fda47f0bf1495d0))
* disable pagination while loading ([5d605c1](https://github.com/ShadyDonkey/torkin-bot/commit/5d605c1c636033a0c06d4b2be8a94c709554784a))
* ensure replies are awaited in find and trending commands ([17504a4](https://github.com/ShadyDonkey/torkin-bot/commit/17504a45e72b208cc874fe84d59fa973ea50518f))
* extra dollar sign in the help command ([af86d13](https://github.com/ShadyDonkey/torkin-bot/commit/af86d13e6ddd0ae0bbee136373f6edc88d918c4a))
* improve subcommand error handling in find command ([e4cba65](https://github.com/ShadyDonkey/torkin-bot/commit/e4cba65f078d513548b4a47912e99b878fb4d892))
* log uncaught errors instead of process exit ([b56519f](https://github.com/ShadyDonkey/torkin-bot/commit/b56519f796fe3b007a8390e2e1fd0d33ce2be630)), closes [#67](https://github.com/ShadyDonkey/torkin-bot/issues/67)
* remove redundant undefined ([edeab4e](https://github.com/ShadyDonkey/torkin-bot/commit/edeab4ea242325fa5eb7c4d91fb8968a25488255))
* remove the server function causing build errors ([53a6ce4](https://github.com/ShadyDonkey/torkin-bot/commit/53a6ce4b707b50449ea36aab01cbe9836c37c9f2))
* reorder devDependencies and peerDependencies in package.json ([d45ca78](https://github.com/ShadyDonkey/torkin-bot/commit/d45ca7813bcf879bc9f8df18bf57274bc7de1bb2))
* simplify searchType assignment in find command ([f2c6e64](https://github.com/ShadyDonkey/torkin-bot/commit/f2c6e645e04e20b7e3561a31ec56585087a87419))
* standardize pagination property names in paginateArray function ([9f824af](https://github.com/ShadyDonkey/torkin-bot/commit/9f824afaaae23bcb1290e548467ecac73e2875bd))
* **trending:** implement trending movies and TV shows response handling ([672e978](https://github.com/ShadyDonkey/torkin-bot/commit/672e978b18a0e977ef97d072a0fd269212aa9641))
* **trending:** remove unused imports in trending command ([79e8103](https://github.com/ShadyDonkey/torkin-bot/commit/79e8103183abc53ff6e756d409f15c3252bb5668))
* tsc issues ([1993288](https://github.com/ShadyDonkey/torkin-bot/commit/1993288fde9cd6867abe37a32bff1a6b1871191f))
* typo ([8ea7f5f](https://github.com/ShadyDonkey/torkin-bot/commit/8ea7f5f97bf49acc7614623886d474e32d5ceffa))
* undefined risk for getTreaty on client ([8e18f41](https://github.com/ShadyDonkey/torkin-bot/commit/8e18f415b01faafe702c44aea3f7f570d98aeaa5))
* update @dressed/react ([b2808f7](https://github.com/ShadyDonkey/torkin-bot/commit/b2808f708606fd21c03c94d59abae81e135871b7))
* update default_member_permissions to be environment dependent ([e978495](https://github.com/ShadyDonkey/torkin-bot/commit/e978495fb51f63451c47e0b16988e62562f09652))
* wrong details displaying when clicking items on other pages ([#53](https://github.com/ShadyDonkey/torkin-bot/issues/53)) ([e85d67f](https://github.com/ShadyDonkey/torkin-bot/commit/e85d67f319e2b0a9d232f6dd529a9feb012c8e26))


### Code Refactoring

* **adult:** move checks to api fns ([#83](https://github.com/ShadyDonkey/torkin-bot/issues/83)) ([3c11ed6](https://github.com/ShadyDonkey/torkin-bot/commit/3c11ed61c6bf7b1c41cb89771ce9340dae56c107))
* blank commit, ignore. ([cfd3af6](https://github.com/ShadyDonkey/torkin-bot/commit/cfd3af6bf94064ae2b30819af37eccb6d2615106))
* change logger name to botLogger ([#78](https://github.com/ShadyDonkey/torkin-bot/issues/78)) ([12a9494](https://github.com/ShadyDonkey/torkin-bot/commit/12a94949c31cacffc6faf84f3a354bc79a9b367e))
* component pattern types and typesafe find cmd ([#2](https://github.com/ShadyDonkey/torkin-bot/issues/2)) ([2989ce8](https://github.com/ShadyDonkey/torkin-bot/commit/2989ce8d8614c48430c53ad2b2322cf8dadb5413))
* **components:** change layout of actions ([#29](https://github.com/ShadyDonkey/torkin-bot/issues/29)) ([e1421a3](https://github.com/ShadyDonkey/torkin-bot/commit/e1421a390bf74a9fe7d0416b842ab27169495893))
* **components:** use processor fn for simplicity ([#6](https://github.com/ShadyDonkey/torkin-bot/issues/6)) ([b80e8fc](https://github.com/ShadyDonkey/torkin-bot/commit/b80e8fc741a526fb37016b6f32504aa4d7e2e531))
* **listing previews:** abstract into component ([#34](https://github.com/ShadyDonkey/torkin-bot/issues/34)) ([61db939](https://github.com/ShadyDonkey/torkin-bot/commit/61db939b1270a98a156f7c32b583db40c7ab8e26))
* **listing-preview:** reword details label ([d7ff365](https://github.com/ShadyDonkey/torkin-bot/commit/d7ff365a4ebf9852ab32b93a145d5224e023635a))
* **listingpage:** fallback on simple details while query loads ([f0b7d19](https://github.com/ShadyDonkey/torkin-bot/commit/f0b7d195b71fc01f30c0c701e721e7b64bd5b156))
* **logger:** consolidate logger imports and create module-specific loggers ([#28](https://github.com/ShadyDonkey/torkin-bot/issues/28)) ([5f16229](https://github.com/ShadyDonkey/torkin-bot/commit/5f162296b164f40369b0540cb8970236b8137f2c))
* make trending client rendered ([#39](https://github.com/ShadyDonkey/torkin-bot/issues/39)) ([22bfa50](https://github.com/ShadyDonkey/torkin-bot/commit/22bfa50f03ddbba8b9fba028ce802e4db7bd9bcc))
* **middleware:** simpler param spread ([37950ab](https://github.com/ShadyDonkey/torkin-bot/commit/37950ab9103e741bdc03c0e5debca9ed036e7bee))
* move provider into patchInteraction ([9114bea](https://github.com/ShadyDonkey/torkin-bot/commit/9114bead412aad6c620809a42d1d1f7996ebdc37))
* **preferences:** move db query to upsert ([a06d08d](https://github.com/ShadyDonkey/torkin-bot/commit/a06d08d022bd65e3de991400a30ab536b3e41104))
* **tmdb:** rewrite the TMDB API completely to break up logic ([#35](https://github.com/ShadyDonkey/torkin-bot/issues/35)) ([ae389fe](https://github.com/ShadyDonkey/torkin-bot/commit/ae389fece0edb38c59a3d958e842d7b51516c9c7))
* **trending:** standardize data and suspendable component ([#36](https://github.com/ShadyDonkey/torkin-bot/issues/36)) ([c25a1bf](https://github.com/ShadyDonkey/torkin-bot/commit/c25a1bf8430079ffbe5f77513aed29a690930b5b))
* use generic const in command configs ([89424ee](https://github.com/ShadyDonkey/torkin-bot/commit/89424ee5adbc902f368f4bcb24547c2fb968b780))


### Documentation

* add LICENSE and README ([#43](https://github.com/ShadyDonkey/torkin-bot/issues/43)) ([3439746](https://github.com/ShadyDonkey/torkin-bot/commit/3439746d4512f5f6d8abb7b9af6020c1164fbd09))
* fix changelog ([c96d9ed](https://github.com/ShadyDonkey/torkin-bot/commit/c96d9edab130e0aba37a36dbd5bf2271fadc8c69))

## [1.4.0](https://github.com/ShadyDonkey/torkin-bot/compare/v1.3.0...torkin-bot-v1.4.0) (2026-01-09)

### Bug Fixes

* Fixed issue with Release Please config

### Code Refactoring

* **adult:** move checks to api fns ([#83](https://github.com/ShadyDonkey/torkin-bot/issues/83)) ([3c11ed6](https://github.com/ShadyDonkey/torkin-bot/commit/3c11ed61c6bf7b1c41cb89771ce9340dae56c107))

## [1.3.0](https://github.com/ShadyDonkey/torkin-bot/compare/v1.2.0...v1.3.0) (2026-01-08)


### Features

* add webhook handling for Discord events ([#79](https://github.com/ShadyDonkey/torkin-bot/issues/79)) ([34a91e4](https://github.com/ShadyDonkey/torkin-bot/commit/34a91e44635221e3a50d1b2910db2cda64e710c2))


### Bug Fixes

* extra dollar sign in the help command ([af86d13](https://github.com/ShadyDonkey/torkin-bot/commit/af86d13e6ddd0ae0bbee136373f6edc88d918c4a))

## [1.2.0](https://github.com/ShadyDonkey/torkin-bot/compare/v1.1.0...v1.2.0) (2026-01-08)


### Features

* add generic help command ([dfae347](https://github.com/ShadyDonkey/torkin-bot/commit/dfae347b5280203efa08ea0911347744a45fa02d))


### Bug Fixes

* add std serializers to handle proper error serialization ([d607f32](https://github.com/ShadyDonkey/torkin-bot/commit/d607f32051d8abf3d6e14ad09614bca272ed142b))
* undefined risk for getTreaty on client ([8e18f41](https://github.com/ShadyDonkey/torkin-bot/commit/8e18f415b01faafe702c44aea3f7f570d98aeaa5))

## [1.1.0](https://github.com/ShadyDonkey/torkin-bot/compare/v1.0.1...v1.1.0) (2026-01-07)


### Features

* resume and trigger jobs on startup ([#74](https://github.com/ShadyDonkey/torkin-bot/issues/74)) ([6fc855d](https://github.com/ShadyDonkey/torkin-bot/commit/6fc855dfe012df09ae78644807418e89ca3ba1d7))


### Bug Fixes

* log uncaught errors instead of process exit ([b56519f](https://github.com/ShadyDonkey/torkin-bot/commit/b56519f796fe3b007a8390e2e1fd0d33ce2be630)), closes [#67](https://github.com/ShadyDonkey/torkin-bot/issues/67)

## [1.0.1](https://github.com/ShadyDonkey/torkin-bot/compare/v1.0.0...v1.0.1) (2026-01-07)


### Bug Fixes

* create user preferences if not existing ([#72](https://github.com/ShadyDonkey/torkin-bot/issues/72)) ([cd9a9a7](https://github.com/ShadyDonkey/torkin-bot/commit/cd9a9a7a2751c3b289d96eba5fda47f0bf1495d0))

## 1.0.0 (2026-01-07)


### Features

* add Dockerfile and production setup ([#57](https://github.com/ShadyDonkey/torkin-bot/issues/57)) ([9b4117a](https://github.com/ShadyDonkey/torkin-bot/commit/9b4117ae5ca77f0a7f4c3cfaf398e13e69c11861))
* add example environment configuration file ([be64e01](https://github.com/ShadyDonkey/torkin-bot/commit/be64e018c5168a838bdcf1cbb6fef4b0765f7278))
* add initial watchlist addition ([05cebd0](https://github.com/ShadyDonkey/torkin-bot/commit/05cebd07605c830fabd8f49626cb5e4fd6089218))
* add language support in detail responses ([#47](https://github.com/ShadyDonkey/torkin-bot/issues/47)) ([dcf595d](https://github.com/ShadyDonkey/torkin-bot/commit/dcf595de1f895a98dad7a155666f2c4caad489e0))
* add optional opencode review ([eb69b11](https://github.com/ShadyDonkey/torkin-bot/commit/eb69b111bce1931cbc02b211404fa5419396ccc0))
* add provider logo script to upload emojis to Discord ([#44](https://github.com/ShadyDonkey/torkin-bot/issues/44)) ([28b0a7c](https://github.com/ShadyDonkey/torkin-bot/commit/28b0a7cc28a3b987bb9b5482c44c10a5c6ef61b6))
* add recommendations ([#51](https://github.com/ShadyDonkey/torkin-bot/issues/51)) ([363c364](https://github.com/ShadyDonkey/torkin-bot/commit/363c364d0005cdef153b681b9188cd2add18eada))
* add user settings ([#46](https://github.com/ShadyDonkey/torkin-bot/issues/46)) ([f1fe975](https://github.com/ShadyDonkey/torkin-bot/commit/f1fe975c8c71744c2bc41b29921c70bf8be03b14))
* add watchlist basic navigation ([72f77f7](https://github.com/ShadyDonkey/torkin-bot/commit/72f77f74ef61f380a4bf0f12f82df0ce618b9799))
* **admin:** add install commands ([5ad5e05](https://github.com/ShadyDonkey/torkin-bot/commit/5ad5e05655f2a588ebcad081eaf8787c1cb180a5))
* **auth:** add better-auth base ([#63](https://github.com/ShadyDonkey/torkin-bot/issues/63)) ([3448dc4](https://github.com/ShadyDonkey/torkin-bot/commit/3448dc4907159b3612946495a69d7a894abbc5f9))
* **authn:** ensure user owns the interaction ([15e2eda](https://github.com/ShadyDonkey/torkin-bot/commit/15e2edab8b34b284a45d2934bafc3f012afbf05c))
* **cache:** add trending movies and genres caching logic ([e908e9f](https://github.com/ShadyDonkey/torkin-bot/commit/e908e9f91bf2512f66f3d7fe1dae68d30fd68b64))
* **components:** user check ([#27](https://github.com/ShadyDonkey/torkin-bot/issues/27)) ([97074da](https://github.com/ShadyDonkey/torkin-bot/commit/97074dab0c475973ce0546a5ef98a38396755062))
* dedupe provider text for details ([29ea4ae](https://github.com/ShadyDonkey/torkin-bot/commit/29ea4ae60c53d9a6941d6b9fca7309c428a4a18a))
* error page ([4bfe57c](https://github.com/ShadyDonkey/torkin-bot/commit/4bfe57c28905be49124e00c143ecc23ef32d7f20))
* **find:** refactor movie and TV detail handling ([6bd27ff](https://github.com/ShadyDonkey/torkin-bot/commit/6bd27ff6a99c5ad1a8426cba1ab8ce7831cd6c63))
* include updateResponse fn in interaction object ([#3](https://github.com/ShadyDonkey/torkin-bot/issues/3)) ([2f745e1](https://github.com/ShadyDonkey/torkin-bot/commit/2f745e1a4374dca5b3a8ef5c2baafaecb07b512c))
* initial website ([#56](https://github.com/ShadyDonkey/torkin-bot/issues/56)) ([7185b6b](https://github.com/ShadyDonkey/torkin-bot/commit/7185b6b5743247c428e31268accd62c3f8e0bb43))
* **jobs:** add provider scheduled jobs ([#37](https://github.com/ShadyDonkey/torkin-bot/issues/37)) ([a9e1d1c](https://github.com/ShadyDonkey/torkin-bot/commit/a9e1d1c942b9c76754e488efcd01bdbb17d75d0b))
* **jobs:** add trending scheduled jobs ([#31](https://github.com/ShadyDonkey/torkin-bot/issues/31)) ([6f22ff5](https://github.com/ShadyDonkey/torkin-bot/commit/6f22ff5570f1c9729fda291d0615c1afa181c6c3))
* **listing:** add trailers and IMDb links ([557c512](https://github.com/ShadyDonkey/torkin-bot/commit/557c5126d8917d960955c6e4711999ba06281272))
* **logging:** added pino and pino-loki ([#25](https://github.com/ShadyDonkey/torkin-bot/issues/25)) ([e62cc78](https://github.com/ShadyDonkey/torkin-bot/commit/e62cc7806abd4143dc375cbfca9beb6fe4470b86))
* **pagination:** add result pagination and update search functionality ([2fd7a63](https://github.com/ShadyDonkey/torkin-bot/commit/2fd7a634d47f7fa10c1350ac9b2c0d32c5527d27))
* **pagination:** implement paginateArray utility function ([70faa3f](https://github.com/ShadyDonkey/torkin-bot/commit/70faa3fc761521356bc3c63faf79a034f2632a85))
* **paginations:** details back buttons reserve page ([#4](https://github.com/ShadyDonkey/torkin-bot/issues/4)) ([5d85a63](https://github.com/ShadyDonkey/torkin-bot/commit/5d85a63d6fba415710c65d924d4b64f759a0ffd6))
* **pagination:** separate remote IDs for movies and series ([991a36d](https://github.com/ShadyDonkey/torkin-bot/commit/991a36db2cfcc59dec16063232e36a555d691234))
* **pagination:** update pagination button label to show current page ([fc94676](https://github.com/ShadyDonkey/torkin-bot/commit/fc94676573458c4bdd36d98b72fd688cfaa0b0cc))
* **providers:** user preferences ([#66](https://github.com/ShadyDonkey/torkin-bot/issues/66)) ([c754d1a](https://github.com/ShadyDonkey/torkin-bot/commit/c754d1aee3ca775f768948beb8bd14aac2312541))
* **response:** add updateResponse utility for interaction handling ([1717cc3](https://github.com/ShadyDonkey/torkin-bot/commit/1717cc33c39628a9e140025b9c173445d5383587))
* switch to TSS and different approach to setup ([#64](https://github.com/ShadyDonkey/torkin-bot/issues/64)) ([fdf793f](https://github.com/ShadyDonkey/torkin-bot/commit/fdf793f22bb324703e5b2971a69c58967749c5a8))
* **trending:** add pagination and view details buttons for trending content ([41fec7f](https://github.com/ShadyDonkey/torkin-bot/commit/41fec7f1cde961d4f8424f3e6b1ce55db77ec8bf))
* **trending:** add trending movies and TV shows command ([a633351](https://github.com/ShadyDonkey/torkin-bot/commit/a633351709741b366fa3925a09ab0719cf03393d))
* **trending:** refactor period options for movie and TV subcommands ([f3867cb](https://github.com/ShadyDonkey/torkin-bot/commit/f3867cb7aa8b8d29a00c84a75ceeffe0c2e44109))
* **utilities:** add slugify function ([1fca8f6](https://github.com/ShadyDonkey/torkin-bot/commit/1fca8f63a063e872c5fb00a9e3738caf06b3bbb8))
* **view-details:** add view details interaction handler ([1d8684f](https://github.com/ShadyDonkey/torkin-bot/commit/1d8684fb3cee58578c39edd39a3127975740745a))
* **watchlist:** add default watchlist if no previous one exists ([0925bc7](https://github.com/ShadyDonkey/torkin-bot/commit/0925bc72e80d4f8b2408b4e06f554d5e73c67a8d))
* **watchlist:** implement initial watchlist creation and management commands ([f01f9db](https://github.com/ShadyDonkey/torkin-bot/commit/f01f9db15ae137edaed3f96a32866e4437c4f02e))
* **watchlist:** update navigation and do all the item details ([b69474a](https://github.com/ShadyDonkey/torkin-bot/commit/b69474aae0bee841892596b908f8d95354e5f177))


### Bug Fixes

* add block braces, lint rule, and ensure safe returns across codebase ([#33](https://github.com/ShadyDonkey/torkin-bot/issues/33)) ([f9d83b4](https://github.com/ShadyDonkey/torkin-bot/commit/f9d83b46666c4692af26fde14c0fb782755bb9bc))
* change ids for watchlists ([1e89bef](https://github.com/ShadyDonkey/torkin-bot/commit/1e89befcfc547275d907495c7aeeeb55eaf874a7))
* correct import path for paginateSearch utility ([ff6c3f2](https://github.com/ShadyDonkey/torkin-bot/commit/ff6c3f249c287f325fbc0fd55b8f7b2d05ca7dac))
* correct import path for paginateSearch utility ([7656bca](https://github.com/ShadyDonkey/torkin-bot/commit/7656bca937103943d2cb31a6af95a0141700dec0))
* disable pagination while loading ([5d605c1](https://github.com/ShadyDonkey/torkin-bot/commit/5d605c1c636033a0c06d4b2be8a94c709554784a))
* ensure replies are awaited in find and trending commands ([17504a4](https://github.com/ShadyDonkey/torkin-bot/commit/17504a45e72b208cc874fe84d59fa973ea50518f))
* improve subcommand error handling in find command ([e4cba65](https://github.com/ShadyDonkey/torkin-bot/commit/e4cba65f078d513548b4a47912e99b878fb4d892))
* remove redundant undefined ([edeab4e](https://github.com/ShadyDonkey/torkin-bot/commit/edeab4ea242325fa5eb7c4d91fb8968a25488255))
* remove the server function causing build errors ([53a6ce4](https://github.com/ShadyDonkey/torkin-bot/commit/53a6ce4b707b50449ea36aab01cbe9836c37c9f2))
* reorder devDependencies and peerDependencies in package.json ([d45ca78](https://github.com/ShadyDonkey/torkin-bot/commit/d45ca7813bcf879bc9f8df18bf57274bc7de1bb2))
* simplify searchType assignment in find command ([f2c6e64](https://github.com/ShadyDonkey/torkin-bot/commit/f2c6e645e04e20b7e3561a31ec56585087a87419))
* standardize pagination property names in paginateArray function ([9f824af](https://github.com/ShadyDonkey/torkin-bot/commit/9f824afaaae23bcb1290e548467ecac73e2875bd))
* **trending:** implement trending movies and TV shows response handling ([672e978](https://github.com/ShadyDonkey/torkin-bot/commit/672e978b18a0e977ef97d072a0fd269212aa9641))
* **trending:** remove unused imports in trending command ([79e8103](https://github.com/ShadyDonkey/torkin-bot/commit/79e8103183abc53ff6e756d409f15c3252bb5668))
* tsc issues ([1993288](https://github.com/ShadyDonkey/torkin-bot/commit/1993288fde9cd6867abe37a32bff1a6b1871191f))
* typo ([8ea7f5f](https://github.com/ShadyDonkey/torkin-bot/commit/8ea7f5f97bf49acc7614623886d474e32d5ceffa))
* update @dressed/react ([b2808f7](https://github.com/ShadyDonkey/torkin-bot/commit/b2808f708606fd21c03c94d59abae81e135871b7))
* update default_member_permissions to be environment dependent ([e978495](https://github.com/ShadyDonkey/torkin-bot/commit/e978495fb51f63451c47e0b16988e62562f09652))
* wrong details displaying when clicking items on other pages ([#53](https://github.com/ShadyDonkey/torkin-bot/issues/53)) ([e85d67f](https://github.com/ShadyDonkey/torkin-bot/commit/e85d67f319e2b0a9d232f6dd529a9feb012c8e26))


### Reverts

* interaction route ([#26](https://github.com/ShadyDonkey/torkin-bot/issues/26)) ([76856d2](https://github.com/ShadyDonkey/torkin-bot/commit/76856d2583768f9216688182aeee203739bed6d1))

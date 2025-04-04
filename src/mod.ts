import _package from "../package.json";

import { DependencyContainer } from "tsyringe";

import { IPreSptLoadMod } from "@spt/models/external/IPreSptLoadMod";
import { PreSptModLoader } from "@spt/loaders/PreSptModLoader";
import { IPostSptLoadMod } from "@spt/models/external/IPostSptLoadMod";
import { IPostDBLoadMod } from "@spt/models/external/IPostDBLoadMod";
import { DatabaseServer } from "@spt/servers/DatabaseServer";
import { IDatabaseTables } from "@spt/models/spt/server/IDatabaseTables";
import { ILogger } from "@spt/models/spt/utils/ILogger";
import { FileSystemSync } from "@spt/utils/FileSystemSync";
import { JsonUtil } from "@spt/utils/JsonUtil";
import { LogTextColor } from "@spt/models/spt/logging/LogTextColor";

import { Keys, Locale } from "./Types/types";
import { KeysUtils } from "./Utils/KeysUtils";

class BetterKeys implements IPreSptLoadMod, IPostDBLoadMod, IPostSptLoadMod 
{
    private mod: string;
    private modConfig = require("../config/config.json");
    private modPath = "user/mods/BetterKeys";
    private modLoader: PreSptModLoader;
    private logger: ILogger;
    private jsonUtil: JsonUtil;
    private _keys;
    private keysUtils = new KeysUtils();
    private container: DependencyContainer;

    constructor() 
    {
        this.mod = "BetterKeys";
    }

    public preSptLoad(container: DependencyContainer): void 
    {
        this.logger = container.resolve<ILogger>("WinstonLogger");
        this.jsonUtil = container.resolve<JsonUtil>("JsonUtil");
    }

    public postSptLoad(container: DependencyContainer): void 
    {
        this.modLoader = container.resolve<PreSptModLoader>("PreSptModLoader");
    }

    public postDBLoad(container: DependencyContainer): void 
    {
        const fileSystem = container.resolve<FileSystemSync>("FileSystemSync");
        const database = container.resolve<DatabaseServer>("DatabaseServer").getTables();
        this._keys = this.jsonUtil.deserialize(fileSystem.read(`${this.modPath}/db/_keys.json`));

        this.loadDatabase(database, container);
    }

    public loadDatabase(database: IDatabaseTables, container: DependencyContainer): void 
    {
        const maps = [
            {name: "bigmap", key: "56f40101d2720b2a4d8b45d6"}, 
            {name: "factory4", key: "55f2d3fd4bdc2d5f408b4567"}, 
            {name: "Interchange", key: "5714dbc024597771384a510d"},
            {name: "laboratory", key: "5b0fc42d86f7744a585f9105"},
            {name: "Lighthouse", key: "5704e4dad2720bb55b8b4567"},
            {name: "RezervBase", key: "5704e5fad2720bc05b8b4567"},
            {name: "Shoreline", key: "5704e554d2720bac5b8b456e"},
            {name: "Woods", key: "5704e3c2d2720bac5b8b4567"},
            {name: "TarkovStreets", key: "5714dc692459777137212e12"},
            {name: "sandbox", key: "653e6760052c01c1c805532f"}
        ];

        maps.forEach(map => 
        {
            this.load(database, this._keys, map.name, map.key, container);
        });
        this.loadJunk(database, this._keys);
        this.logger.logWithColor(`Finished loading: ${_package.name}-${_package.version}`, LogTextColor.GREEN);
    }

    private load(database: IDatabaseTables, modDb, mapID: string, mapKey: string, container: DependencyContainer): void 
    {
        const fileSystem = container.resolve<FileSystemSync>("FileSystemSync");
        const keyDb: Keys = this.jsonUtil.deserialize(fileSystem.read(`${this.modPath}/db/${mapID}.json`));

        for (const keyID in keyDb.Keys) 
        {
            if (database.templates.items[keyID]) 
            {
                if (!this.modConfig.ChangeMarkedKeysBackground && modDb.MarkedKeys.includes(keyID)) 
                {
                    database.templates.items[keyID]._props.BackgroundColor = "yellow";
                }
                else 
                {
                    const color = this.modConfig.BackgroundColor[database.locales.global["en"][`${mapKey} Name`]];

                    if (color.toUpperCase() !== "OFF")
                        database.templates.items[keyID]._props.BackgroundColor = color;
                }

                const localeData = this.jsonUtil.deserialize(fileSystem.read(`${this.modPath}/locale/locale.json`));

                for (const localeID in database.locales.global) 
                {
                    const originalDesc = database.locales.global[localeID][`${keyID} Description`];
                    let loadedLocale: Locale = localeData["en"];
                    if (localeData && localeData[localeID])
                    {
                        loadedLocale = localeData[localeID];
                    }

                    const betterString = `${loadedLocale.mapString}: ${database.locales.global[localeID][`${mapKey} Name`]}.${this.keysUtils.getExtracts(keyID, keyDb, loadedLocale)}\n${this.keysUtils.isConfigQuestsEnabled(this.modConfig, keyID, keyDb, loadedLocale, database.locales.global[localeID])}${this.keysUtils.isConfigLootEnabled(this.modConfig, keyID, keyDb, loadedLocale)}\n`;
                    database.locales.global[localeID][`${keyID} Description`] = betterString + originalDesc;
                }
            }
        }
        this.logger.info(`Loaded: ${_package.name}-${mapID}`);
    }

    private loadJunk(database: IDatabaseTables, modDb): void
    {
        modDb.JunkKeys.forEach(keyID =>
        {
            if (database.templates.items[keyID]) 
            {
                database.templates.items[keyID]._props.BackgroundColor = this.modConfig.BackgroundColor["JunkKeys"];
            }
        })

    }
}

module.exports = { mod: new BetterKeys() };

import { IDatabaseTables } from "@spt-aki/models/spt/server/IDatabaseTables";
import { Keys, Locale } from "src/Types/types";

export class KeysUtils 
{
    public getExtracts(keyId: string, modDb: Keys, locale: Locale): string 
    {
        let extractList = "";
        for (const extract of modDb.Keys[keyId].Extract)
            extractList = extractList + extract +", ";
        return extractList.length > 0 ? ` ${locale.extractString}: ` + extractList.substring(0,extractList.length-2) + "." : "";
    }

    static getLoot(keyId: string, modDb: Keys, locale: Locale): string 
    {
        let lootList = "";
        for (const lootId of modDb.Keys[keyId].Loot)
            lootList = lootList + locale[lootId]+", ";
        return lootList.length > 0 ? lootList.substring(0,lootList.length-2) : `${locale.no}`;
    }

    static isUsedInQuests(keyId: string, modDb: Keys, locale: Locale, database: IDatabaseTables): string 
    {
        let questList = "";
        for (const quest of modDb.Keys[keyId].Quest)
            questList = questList + database[`${quest} name`] +", ";
        return questList.length > 0 ? questList.substring(0,questList.length-2) : `${locale.no}`;
    }

    public isConfigLootEnabled(config: any, keyId: string, modDb: Keys, locale: Locale): string 
    {
        if (config.AddLootToDesc)
            return `${locale.lootString}: ${KeysUtils.getLoot(keyId, modDb, locale)}.\n`;
        else return "";
    }

    public isConfigQuestsEnabled(config: any, keyId: string, modDb: Keys, locale: Locale, database: IDatabaseTables
    ): string 
    {
        if (config.AddIfUsedInQuestsToDesc)
            return `${locale.questString}: ${KeysUtils.isUsedInQuests(keyId, modDb, locale, database)}.\n`;
        else return "";
    }
}

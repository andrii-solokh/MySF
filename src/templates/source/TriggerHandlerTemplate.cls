/**
 * @description       : TriggerHandler for {{SOBJECT_NAME}} object
 * @author            : andrii.solokh@wipro.com
 * @group             : Core.TriggerHandler
 * @last modified on  : 04-30-2023
 * @last modified by  : andrii.solokh@wipro.com
 **/
public inherited sharing class {{CLASS_NAME}} extends TriggerHandler {
    /**
     * @description Handles logic on before insert event
     * @param  newList 
     */
    protected override void onBeforeInsert(List<SObject> newList) {}

    /**
     * @description Handles logic on after insert event
     * @param  newMap 
     */
    protected override void onAfterInsert(Map<Id, SObject> newMap) {}

    /**
     * @description Handles logic on before update event
     * @param  newMap 
     * @param  oldMap 
     */
    protected override void onBeforeUpdate(Map<Id, SObject> newMap, Map<Id, SObject> oldMap) {
        List<{{SOBJECT_NAME}}> records = (List<{{SOBJECT_NAME}}>) newMap.values();
        Map<Id, {{SOBJECT_NAME}}> oldRecords = (Map<Id, {{SOBJECT_NAME}}>) oldMap;
    }

    /**
     * @description Handles logic on after update event
     * @param  newMap 
     * @param  oldMap 
     */
    protected override void onAfterUpdate(Map<Id, SObject> newMap, Map<Id, SObject> oldMap) {
        List<{{SOBJECT_NAME}}> records = (List<{{SOBJECT_NAME}}>) newMap.values();
        Map<Id, {{SOBJECT_NAME}}> oldRecords = (Map<Id, {{SOBJECT_NAME}}>) oldMap;
    }

    /**
     * @description Handles logic on before delete event
     * @param  oldMap 
     */
    protected override void onBeforeDelete(Map<Id, SObject> oldMap) {}

    /**
     * @description Handles logic on after delete event
     * @param  oldMap 
     */
    protected override void onAfterDelete(Map<Id, SObject> oldMap) {}

    /**
     * @description Handles logic on after undelete event
     * @param  newMap 
     */
    protected override void onAfterUndelete(Map<Id, SObject> newMap) {}
}
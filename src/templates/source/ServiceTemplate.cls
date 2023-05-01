/**
 * @description       : Service class for {{SOBJECT_NAME}} object
 * @author            : andrii.solokh@wipro.com
 * @group             : Core.Service
 * @last modified on  : 04-30-2023
 * @last modified by  : andrii.solokh@wipro.com
 **/
public inherited sharing class {{CLASS_NAME}} implements I{{CLASS_NAME}} {
    public {{CLASS_NAME}}() {}

    /**
     * @description Handle record update
     * @param  records    
     * @param  oldRecords 
     */
    void handleRecordUpdate(List<{{SOBJECT_NAME}}> records, Map<Id, {{SOBJECT_NAME}}> oldRecords);
}
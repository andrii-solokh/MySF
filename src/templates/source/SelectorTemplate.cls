/**
 * @description       : Selector for {{SOBJECT_NAME}} object
 * @author            : andrii.solokh@wipro.com
 * @group             : Core.Selector
 * @last modified on  : 05-04-2023
 * @last modified by  : andrii.solokh@wipro.com
 **/
public inherited sharing class {{CLASS_NAME}} extends AbstractSelector implements I{{CLASS_NAME}} {
    /**
     * @description Return list of fields to be queried
     * @return
     */
    public override SObjectType getObject() {
        return {{SOBJECT_NAME}}.getSObjectType();
    }

    /**
     * @description Return SObject type
     * @return
     */
    public override List<SObjectField> getFields() {
        return new List<SObjectField>{ {{FIELD_NAMES}}};
    }

    /**
     * @description Return map of related fields to be queried and related selector from which fields will be taken
     * @return
     */
    public override Map<SObjectField,Type> getIncludedRelatedFields() {
        return new Map<SObjectField,Type>{};
    }

    public {{CLASS_NAME}}() {
    }

    /**
     * @description Query record by Id
     * @param  recordId 
     * @return          
     */
    public {{SOBJECT_NAME}} getById(Id recordId) {
        return ({{SOBJECT_NAME}}) getRecordById(recordId);
    }

    /**
     * @description Query all records
     * @return   
     */
    public List<{{SOBJECT_NAME}}> getAll() {
        return (List<{{SOBJECT_NAME}}>) getAllRecords();
    }

    /**
     * @description Query records by field
     * @param  field 
     * @param  value 
     * @return
     */
    public List<{{SOBJECT_NAME}}> getByField(SObjectField field, Object value) {
        return (List<{{SOBJECT_NAME}}>) getRecordsByField(field, value);
    }
}

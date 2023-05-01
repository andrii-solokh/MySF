/**
 * @description       : Selector for {{SOBJECT_NAME}} object
 * @author            : andrii.solokh@wipro.com
 * @group             : Core.Selector
 * @last modified on  : 04-30-2023
 * @last modified by  : andrii.solokh@wipro.com
 **/
public inherited sharing class {{CLASS_NAME}} implements I{{CLASS_NAME}} {
    
    public static final List<String> ALL_FIELD_NAMES = new List<String>{
        {{FIELD_NAMES_QUOTED}}
    };
    
    public {{CLASS_NAME}}() {}

    /**
     * @description Query record by Id
     * @param  recordId 
     * @return          
     */
    public {{SOBJECT_NAME}} getById(Id recordId) {
        String query = 'SELECT ' + String.join(ALL_FIELD_NAMES, ',') + ' FROM Account WHERE Id = :recordId';
        return Database.query(query);
    }

    /**
     * @description Query all records
     * @return          
     */
    public List<{{SOBJECT_NAME}}> getAll() {
        String query = 'SELECT ' + String.join(ALL_FIELD_NAMES, ',') + ' FROM Account';
        return Database.query(query);
    }
}
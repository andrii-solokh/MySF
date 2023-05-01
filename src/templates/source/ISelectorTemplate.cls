/**
 * @description       : Selector interface for {{SOBJECT_NAME}} object
 * @author            : andrii.solokh@wipro.com
 * @group             : Core.Selector
 * @last modified on  : 04-30-2023
 * @last modified by  : andrii.solokh@wipro.com
 **/
public interface {{CLASS_NAME}}  {
    /**
     * @description Query record ({{SOBJECT_NAME}}) by Id
     * @param  recordId 
     * @return          
     */
    {{SOBJECT_NAME}} getById(Id recordId);

    /**
     * @description Query all records 
     * @return          
     */
    List<{{SOBJECT_NAME}}> getAll();
}

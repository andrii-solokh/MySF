/**
 * @description       : Trigger for {{SOBJECT_NAME}} object
 * @author            : andrii.solokh@wipro.com
 * @group             : Core.Trigger
 * @last modified on  : 04-24-2023
 * @last modified by  : andrii.solokh@wipro.com
**/
trigger {{CLASS_NAME}} on {{SOBJECT_NAME}}(
    before insert,
    before update,
    before delete,
    after insert,
    after update,
    after delete,
    after undelete
) {
    new {{CLASS_NAME}}Handler().run();
}

public with sharing class GuestAllocationsHelper {
  @AuraEnabled(cacheable=true)
  public static OutputData queryCampaignMembers(String parentCampaignId) {
    
    OutputData theOutput = new OutputData();
    Set<Id> contactIdSet = new Set<Id>();

    for (Campaign c : [SELECT Id, Name FROM Campaign WHERE parentId =: parentCampaignId]) {
      theOutput.columnList.add(new column(c.Name, c.id));
    }

    for (CampaignMember cm : [SELECT Id, ContactId, Campaign.Name FROM CampaignMember WHERE Campaign.ParentId = :parentCampaignId]) {
      contactIdSet.add(cm.contactId);
    }

    for (Contact c: [SELECT Id, FirstName, LastName, Email, (SELECT Id, CampaignId, Campaign.Name FROM CampaignMembers WHERE Campaign.ParentId = :parentCampaignId)  FROM Contact WHERE Id IN :contactIdSet]){
      theOutput.rowList.add(c);
    } 

    return theOutput;
  }

  public class OutputData {
    @AuraEnabled
    public List<Column> columnList;
    @AuraEnabled
    public List<Contact> rowList;

    public OutputData(){
      this.columnList = new List<Column>();
      this.rowList = new List<Contact>();
    }
  }
  public class Column {
    @AuraEnabled
    public string label;
    @AuraEnabled
    public string id;

    public Column(string label, string id){
      this.label = label;
      this.id = id;
    }
  }

  @AuraEnabled
  public static void deleteCampaignMembers (Id parentCampaignId, List<Id> contactIdList){
    
    System.debug('INPUT' + parentCampaignId + contactIdList);
    List <CampaignMember> campaignMembersToDelete = [SELECT Id FROM CampaignMember WHERE ContactId IN : contactIdList AND Campaign.ParentId = :parentCampaignId];
    
    try {
        delete campaignMembersToDelete;
      }
      catch(Exception ex) {
        throw new AuraHandledException(ex.getMessage());
      }
  }
}
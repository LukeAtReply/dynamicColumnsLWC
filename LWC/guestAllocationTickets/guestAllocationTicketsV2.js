import { LightningElement, wire, api } from 'lwc';
import queryCampaignMembers from '@salesforce/apex/GuestAllocationsHelper.queryCampaignMembers';
import deleteCampaignMembers from '@salesforce/apex/GuestAllocationsHelper.deleteCampaignMembers';
import addGuestModal from 'c/guestAllocationTicketsModal';

export default class GuestAllocationsHelperExample extends LightningElement {
    @api recordId;
    data = [];
    columns = [];

    @wire(queryCampaignMembers, { parentCampaignId: '$recordId' })
    wiredData({ data, error }) {

        if (data) {
            // Create default columns for data table
            let columns = [{ label: 'First Name', fieldName: 'FirstName', type: 'text' },
            { label: 'Last Name', fieldName: 'LastName', type: 'text' },
            { label: 'Email', fieldName: 'Email', type: 'email' },];
            let contacts = [];
            
            // Gets dynamic columns from apex method. Adds them to columns array. 
            for (let i = 0; i < data.columnList.length; i++) {
                columns.push({label: data.columnList[i].label, fieldName: data.columnList[i].id, type: 'boolean'})
            }

            // Gets row data from apex method.  
            for (let i = 0; i < data.rowList.length; i++) {
                let contact = {id: data.rowList[i].Id ,FirstName : data.rowList[i].FirstName, LastName : data.rowList[i].LastName, Email : data.rowList[i].Email};

                for (let x = 0; x < data.rowList[i].CampaignMembers.length; x++) {
                    contact[data.rowList[i].CampaignMembers[x].CampaignId] = true
                }
                contacts.push(contact)
            }

            this.columns = columns;
            this.data = contacts;

        } else {
            console.log('error' + error);
        }
    }

    // Handles add guest button, sends recordId to addGuestModal.
    handleAddGuest(){
        addGuestModal.open({
            recordId: this.recordId
        }).then((result) => {
            console.log(result);
        });
    }

    // Handles delete, sends recordId and contact Id list to deleteCampaignMembers apex method. 
    handleDelete(){
        let dt = this.template.querySelector('lightning-datatable');
        let selected = dt.getSelectedRows();
        let contacts = [];

        for (let i = 0; i < selected.length; i++) {
            contacts.push(selected[i].id)
        }
        console.log('Ids', JSON.stringify(selected));

        if (contacts.length > 0) {
            
            deleteCampaignMembers({parentCampaignId: this.recordId, contactIdList : contacts})
            .then(result => {
                console.log('Result', result);
            })
            .catch(error => {
                console.log('error', error);
            });

            window.location.reload();
        }
    }
}
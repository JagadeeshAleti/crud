import * as React from 'react'
import { useToast } from 'uxp/components'
import { IAddViewProps, IDefaultUXPProps } from '../../../../crud-component'
import { handleErrorResponse, handleSuccessResponse } from '../../../utils'
import DynamicFormComponent from './components/DynamicFormComponent'

interface IAddItemFormProps extends IAddViewProps, IDefaultUXPProps {
    entityName: string,
    changeMode: any,
    model: string,
    collection: string
}

const AddView: React.FunctionComponent<IAddItemFormProps> = (props) => {
    let { uxpContext, renderCustom: CustomAddView, changeMode, model, collection } = props

    return <div className='mda-spa-crud-add-view-container'>
        {
            CustomAddView
                ? <CustomAddView uxpContext={uxpContext} changeMode={changeMode} model={model} collection={collection} />
                : <AddForm {...props} />
        }
    </div>
}

const AddForm: React.FunctionComponent<IAddItemFormProps> = (props) => {
    let { uxpContext, entityName, model, collection, changeMode, default: { formStructure, model: addModel, action: addAction } = {} } = props
    let toast = useToast()

    if (!formStructure) {
        changeMode('list')
    }

    async function handleSubmit(data: any) {

        try {
            if (model && collection && !addAction && !addModel) {
                const params = {
                    document: JSON.stringify({ ...data }),
                    modelName: model,
                    collection: collection
                }
                await uxpContext.executeService("Lucy", "AddNewDocument", params);
            } else {
                await uxpContext.executeAction(addModel, addAction, data, { json: true });
            }
            toast.success(`${entityName} created successfully`);
            changeMode('list');

        } catch (e) {
            toast.error('Something went wrong');
            changeMode('list');
        }

    }

    return <DynamicFormComponent
        formStructure={formStructure}
        onSubmit={handleSubmit}
        onCancel={() => changeMode('list')}
    />
}

export default AddView 
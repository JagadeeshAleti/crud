import * as React from 'react'
import { Loading, NotificationBlock, useToast } from 'uxp/components'
import { IDefaultUXPProps, IEditViewProps, IFormFieldDefinition } from '../../../../crud-component'
import { Conditional } from '../ConditionalComponent'
import DynamicFormComponent from './components/DynamicFormComponent'

interface IEditItemFormProps extends IEditViewProps, IDefaultUXPProps {
    entityName: string,
    changeMode: any,
    id: string,
    model: string,
    collection: string
}

const EditView: React.FunctionComponent<IEditItemFormProps> = (props) => {

    let { uxpContext, renderCustom: CustomAddView, changeMode, id, model, collection } = props;

    console.log({ props });


    return <div className='mda-spa-crud-add-view-container'>
        {
            CustomAddView
                ? <CustomAddView uxpContext={uxpContext} changeMode={changeMode} id={id} model={model} collection={collection} />
                : <EditForm {...props} />
        }
    </div>
}

const EditForm: React.FunctionComponent<IEditItemFormProps> = (props) => {
    let { uxpContext, entityName, id, model, collection, changeMode, default: { formStructure } = {} } = props;
    if (!formStructure) {
        changeMode('list');
    }
    let toast = useToast()
    const [modelKey, setModelKey] = React.useState('');


    let [structure, setStructure] = React.useState<IFormFieldDefinition[]>([])
    let [error, setError] = React.useState(null)
    let [loading, setLoading] = React.useState(true)


    React.useEffect(() => {
        getModelKey();
        getItemDetails();
    }, [])

    async function getModelKey() {
        const result = await props.uxpContext.executeService('System', 'MetadataMap:KeyByname', { Name: model });
        const details = JSON.parse(result);
        const { Key } = details[0];
        setModelKey(Key);
    };

    async function getItemDetails() {
        setLoading(true)
        const params = {
            collectionName: collection,
            modelName: model,
            max: 1,
            filter: JSON.stringify({ _id: id })
        };

        try {
            const res = await uxpContext.executeService("Lucy", "GetPaginatedDocs", params);
            const { data: d } = JSON.parse(res)[0];
            let data = JSON.parse(d)[0];
            console.log({ data });
            if (data) {
                let updated = formStructure.map(f => {
                    let _val = data[f.name]
                    f.value = _val

                    return f
                })
                setStructure(updated)
                setLoading(false)
                return
            }
            setLoading(false)
            toast.error("Invalid Response")
            setError("Invalid Response")
        } catch (e) {

            console.log(`Unable to get ${entityName} details. Exception: `, e);
            setLoading(false)
        }
    }

    async function handleSubmit(data: any) {
        try {
            const params = {
                _id: id,
                document: JSON.stringify({ ...data }),
                model: modelKey,
                collection: collection,
                replace: ''
            }
            await props.uxpContext.executeService("Lucy", "UpdateDocument", params);
            toast.success(`${entityName} updated successfully!!!`)
            changeMode('list', null);
        } catch (e) {
            console.log(e);
        }
    }

    return <>
        <Conditional visible={loading} > <Loading /> </Conditional>
        <Conditional visible={error != null} > <NotificationBlock message={error} /> </Conditional>
        <Conditional visible={!loading && error == null} >
            <DynamicFormComponent
                formStructure={structure}
                onSubmit={handleSubmit}
                onCancel={() => changeMode('list')}
            />
        </Conditional>

    </>
}

export default EditView 
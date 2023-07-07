import * as React from 'react'
import { IContextProvider } from './uxp';
import { useToast } from 'uxp/components';
import { Conditional } from '../src/components/common/ConditionalComponent';
import CrudComponent from './components/common/CrudComponent/CrudComponent';
import DynamicFormComponent from './components/common/CrudComponent/components/DynamicFormComponent';


interface IViolationTypesProps { uxpContext: IContextProvider }

const Widget1: React.FunctionComponent<IViolationTypesProps> = (props) => {
    const toast = useToast();
    const { uxpContext } = props;

    return <>
        <Conditional visible={true}>

            <div className="page-content">
                <CrudComponent
                    entityName='User Type'
                    // model="crud"
                    // collection="users"
                    uxpContext={uxpContext}
                    list={{
                        default: {
                            model: "crud",
                            action: "getAllTypes",
                            itemId: "_id",
                            canDelete: true,
                            canEdit: true,
                            canCreate: true,
                            columns: [
                                {
                                    name: "Name",
                                    valueField: "name",
                                    columnWidth: ''
                                },
                                {
                                    name: "Description",
                                    valueField: "description",
                                    columnWidth: ''
                                },
                                {
                                    name: "Amount",
                                    valueField: "amount",
                                    columnWidth: ''
                                }
                            ],
                            deleteItem: {
                                model: "crud",
                                action: "delete"
                            },
                            toolbar: {
                                search: {
                                    show: true,
                                    searchableFields: ["name"]
                                },
                                buttons: { export: { show: true, columns: { 'name': "Name", 'description': 'Description' } } }

                            }
                        }
                    }}
                    add={{
                        default: {
                            model: "crud",
                            action: "create",
                            formStructure: [
                                {
                                    label: "Name",
                                    name: "name",
                                    type: "string",
                                    validate: {
                                        required: true
                                    },
                                },
                                {
                                    label: "Description",
                                    name: "description",
                                    type: "string",
                                },
                                {
                                    label: "Amount",
                                    name: "amount",
                                    type: "string",
                                }
                            ]
                        }
                    }}
                    edit={{
                        default: {
                            getDetails: {
                                model: "crud",
                                action: "getById",
                            },
                            model: "crud",
                            action: "update",
                            formStructure: [
                                {
                                    label: "Name",
                                    name: "name",
                                    type: "string",
                                    validate: {
                                        required: true
                                    },
                                },
                                {
                                    label: "Description",
                                    name: "description",
                                    type: "string",
                                },
                                {
                                    label: "Amount",
                                    name: "amount",
                                    type: "string",
                                }
                            ]
                        }
                    }}

                />
            </div>
        </Conditional>
    </>
}

const Create: React.FunctionComponent<{ uxpContext: IContextProvider, changeMode: any, model: string, collection: string }> = (props) => {

    const { uxpContext, changeMode, model, collection } = props;
    console.log({ model, collection });

    const toast = useToast();

    const [formData, setFormData] = React.useState<any>({})

    function getValue(field: string) {
        let value = ""
        if (formData && formData[field]) {
            value = formData[field]
        }
        return value
    }

    let structure = [
        {
            label: "Name",
            name: "name",
            type: "string",
            validate: {
                required: true
            },
            value: getValue("name")
        },
        {
            label: "Description",
            name: "description",
            type: "string",
            value: getValue("description")
        },
        {
            label: "Amount",
            name: "amount",
            type: "string",
            value: getValue("amount")
        }
    ];

    async function handleSubmit(data: any) {
        const params = {
            document: JSON.stringify({ ...data }),
            modelName: model,
            collection: collection
        }

        try {
            await props.uxpContext.executeService("Lucy", "AddNewDocument", params);
            toast.success("User created successfully!!!");
            changeMode('list');
        } catch (e) {
            console.log("Exception:", e);
        }

    }


    return <>
        <DynamicFormComponent
            formStructure={structure}
            onSubmit={handleSubmit}
            onCancel={() => changeMode('list')}
            onChange={(prevData, newData) => {
                setFormData(newData)
                return newData
            }}
        />
    </>
}

const Edit: React.FunctionComponent<{ uxpContext: IContextProvider, changeMode: any, id: string, model: string, collection: string }> = (props) => {
    const { uxpContext, id, changeMode, model, collection } = props;
    console.log({ model, collection });

    const toast = useToast();
    const [modelKey, setModelKey] = React.useState('');
    const [formData, setFormData] = React.useState<any>({})

    React.useEffect(() => {
        getModelKey();
        getFormData();
    }, []);

    async function getModelKey() {
        const result = await props.uxpContext.executeService('System', 'MetadataMap:KeyByname', { Name: model });
        const details = JSON.parse(result);
        const { Key } = details[0];
        setModelKey(Key);
    };

    async function getFormData() {
        const params = {
            collectionName: collection,
            modelName: model,
            max: 1,
            filter: JSON.stringify({ _id: id })
        };
        const response = await uxpContext.executeService("Lucy", "GetPaginatedDocs", params);
        const { data } = JSON.parse(response)[0];
        const formData = JSON.parse(data)[0];
        setFormData(formData)
    }
    function getValue(field: string) {
        let value = ""
        if (formData && formData[field]) {
            value = formData[field]
        }

        return value
    }

    let structure = [
        {
            label: "Name",
            name: "name",
            type: "string",
            validate: {
                required: true
            },
            value: getValue("name")
        },
        {
            label: "Description",
            name: "description",
            type: "string",
            value: getValue("description")
        },
        {
            label: "Amount",
            name: "amount",
            type: "string",
            value: getValue("amount")
        }
    ];

    async function handleSubmit(data: any) {
        try {
            const params = {
                _id: id,
                document: JSON.stringify({ ...formData }),
                model: modelKey,
                collection: collection,
                replace: ''
            }
            await props.uxpContext.executeService("Lucy", "UpdateDocument", params);
            changeMode('list', null);
        } catch (e) {
            console.log(e);
        }
    }

    return <>
        <DynamicFormComponent
            formStructure={structure}
            onSubmit={handleSubmit}
            onCancel={() => changeMode('list')}
            onChange={(prevData, newData) => {
                setFormData(newData)
                return newData
            }}
        />
    </>
}

export default Widget1
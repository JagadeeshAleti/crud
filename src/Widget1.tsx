import * as React from 'react'
import { IContextProvider } from './uxp';
import { Loading, NotificationBlock, useToast } from 'uxp/components';
import { useHistory, useParams } from 'react-router-dom';
import { Conditional } from '../src/components/common/ConditionalComponent';
import CrudComponent from './components/common/CrudComponent/CrudComponent';
import DynamicFormComponent from './components/common/CrudComponent/components/DynamicFormComponent';
import { handleErrorResponse, handleSuccessResponse } from './utils';
import { tr } from 'date-fns/locale';


interface IViolationTypesProps { uxpContext: IContextProvider }

const Widget1: React.FunctionComponent<IViolationTypesProps> = (props) => {
    const toast = useToast();
    const { uxpContext } = props;

    return <>
        <Conditional visible={true}>

            <div className="page-content">
                <CrudComponent
                    entityName='Violation Types'
                    uxpContext={uxpContext}
                    roles={{}}
                    list={{
                        default: {
                            model: "crud",
                            action: "getAllTypes",
                            itemId: "_id",
                            responseCodes: {
                                successCode: 103701,
                                errorCodes: {
                                    103702: [
                                        { error: 'ERR_FETCHING_VIOLATIONS', message: 'Unable to get Violation Types. Something went wrong' }
                                    ]
                                }
                            },
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
                                action: "delete",
                                responseCodes: {
                                    successCode: 201,
                                    successMessage: "",
                                    errorCodes: {
                                        404: []
                                    }
                                }
                            },
                            toolbar: {
                                search: {
                                    show: true,
                                    searchableFields: ["name"]
                                }
                            }
                        }
                    }}
                    add={{
                        renderCustom: Create
                    }}
                    edit={{
                        renderCustom: Edit
                    }}

                />
            </div>
        </Conditional>
    </>
}

const Create: React.FunctionComponent<{ uxpContext: IContextProvider, changeMode: any }> = (props) => {

    const { uxpContext, changeMode } = props;

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
        uxpContext.executeAction("crud", "create", { ...data }, { json: true })
            .then(res => {
                changeMode('list');
                toast.success("User created successfully!!!");
            })
            .catch(e => {
                console.log("Exception:", e);
            })
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

const Edit: React.FunctionComponent<{ uxpContext: IContextProvider, changeMode: any, id: string }> = (props) => {
    const { uxpContext, id, changeMode } = props;
    console.log({ id, changeMode });

    const toast = useToast();
    const [formData, setFormData] = React.useState<any>({})

    React.useEffect(() => {
        getFormData();
    }, []);

    async function getFormData() {
        const response = await uxpContext.executeAction('crud', 'getById', { _id: id }, { json: true });
        console.log({ response });
        setFormData(response)
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
            await uxpContext.executeAction("crud", "update", { ...formData, _id: id }, { json: true });
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
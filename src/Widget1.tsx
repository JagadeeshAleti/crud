import * as React from 'react'
import { IContextProvider } from './uxp';
import { Loading, NotificationBlock, useToast } from 'uxp/components';
import { useHistory, useParams } from 'react-router-dom';
import { Conditional } from '../src/components/common/ConditionalComponent';
import CrudComponent from './components/common/CrudComponent/CrudComponent';
import DynamicFormComponent from './components/common/CrudComponent/components/DynamicFormComponent';
import { handleErrorResponse, handleSuccessResponse } from './utils';


interface IViolationTypesProps { uxpContext: IContextProvider }

const Widget1: React.FunctionComponent<IViolationTypesProps> = (props) => {
    const toast = useToast();
    const { uxpContext } = props;
    const [data, setData] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState<boolean>(true);

    // const mapActionData = React.useCallback((item) => {
    //     console.log({ item });

    //     return item;
    // }, [])


    console.log({ data });

    return <>
        <Conditional visible={false}>
            <div className="loading-text">
                <Loading />
                <span>Loading Violation types</span>
            </div>
        </Conditional>
        <div>Checking Crud</div>
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
                            // mapActionData,
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

const Create: React.FunctionComponent<{ uxpContext: IContextProvider }> = (props) => {
    const { uxpContext } = props;
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
            // onCancel={handleCancel}
            onChange={(prevData, newData) => {
                setFormData(newData)
                return newData
            }}
        />
    </>
}

const Edit: React.FunctionComponent<{ uxpContext: IContextProvider }> = (props) => {
    const { uxpContext } = props;
    const toast = useToast();
    // let { id: _id } = useParams<{ id: string }>()
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

        uxpContext.executeAction("crud", "update", { ...data, id: '_id' }, { json: true })
            .then(res => {
                toast.success("User updated successfully")
            })
            .catch(e => {
                console.log("Exception:", e);

            })
    }

    return <>
        <DynamicFormComponent
            formStructure={structure}
            onSubmit={handleSubmit}
            // onCancel={handleCancel}
            onChange={(prevData, newData) => {
                setFormData(newData)
                return newData
            }}
        />
    </>
}

export default Widget1
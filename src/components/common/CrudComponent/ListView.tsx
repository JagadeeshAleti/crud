import * as React from 'react'
import { Link, useRouteMatch } from 'react-router-dom';
import { Button, FormField, IconButton, IDataTableColumn, Input, SearchBox, Tooltip, useToast } from 'uxp/components';
import { IDefaultUXPProps, IListViewProps } from '../../../../crud-component';
import { debounce, handleErrorResponse, handleSuccessResponse, hasAnyRole } from '../../../utils';
import { Conditional } from '../ConditionalComponent';
import useExportToExcel from '../CustomHooks/useExportToExcel';
import ConfirmPopup from '../PopupAlert/ConfirmPopup';
import MemorizedDataTable from './components/MemorizedDataTable';
import classNames from 'classnames';

import plusIcon from '../../../assets/images/plus-circle.svg'
import printIcon from '../../../assets/images/print.svg'
import downloadIcon from '../../../assets/images/download.svg'
import editIcon from '../../../assets/images/edit.svg'
import deleteIcon from '../../../assets/images/delete.svg'
import { format } from 'date-fns';


interface IListProps extends IDefaultUXPProps, IListViewProps {
    entityName: string,
    roles: any
    changeMode: any
}

const ListView: React.FunctionComponent<IListProps> = (props) => {

    let { uxpContext, renderCustom: CustomListComponent, roles } = props
    // let { path } = useRouteMatch()

    return <div className={classNames("mda-spa-crud-component-list-container")}>
        {
            CustomListComponent
                ? <CustomListComponent uxpContext={uxpContext} />
                : <ListComponent {...props} />
        }
    </div>
}

export const ListComponent: React.FunctionComponent<IListProps> = (props) => {
    let { uxpContext, entityName, roles, default: { model, action, labels, mapActionData, filterData, responseCodes, columns, pageSize, actions, deleteItem, itemId, toolbar }, renderCustom, changeMode } = props

    let { show: showToolbar, buttons, search } = toolbar

    // let { path } = useRouteMatch()
    let toast = useToast()

    let [deleteId, setDeleteId] = React.useState(null)
    let [counter, setCounter] = React.useState(0)
    let [canAdd, setCanAdd] = React.useState(true)
    let [canEdit, setCanEdit] = React.useState(true)
    let [canDelete, setCanDelete] = React.useState(true)
    const [query, setQuery] = React.useState<string>('');
    const [searchQuery, setSearchQuery] = React.useState<string>('');
    const [data, setData] = React.useState<any[]>([]);


    // update search quey 
    const updateSearchQery = debounce(() => {
        setSearchQuery(query)
    }, 300)

    React.useEffect(() => {
        updateSearchQery()
    }, [query])

    const searchData = (query: string, records: any[]) => {
        let fields = search.searchableFields || []
        if (fields.length == 0) return records

        // get fields and create a filter condition 
        // cleaning user input
        let regExp = /[^\w\s+-@]/gi;
        let cleanedSearchText = (query || "").replace(regExp, "");
        if (cleanedSearchText.trim().length == 0) return records
        let queryRegexp = new RegExp(cleanedSearchText, 'i');

        return records.filter((record) => {
            for (let field of fields) {
                if (queryRegexp.test(record[field])) {
                    return true
                }
            }
            return false
        })
    }

    let getData = React.useCallback((max: number, last: string, args: any) => {
        console.log("Get Data is calling");

        return new Promise<{ items: any[], pageToken: string }>((done, nope) => {
            console.log("last ", last);

            let params: any = { max: max }
            if (last) params.last = last
            uxpContext.executeAction(model, action, params, { json: true })
                .then(data => {
                    console.log("Response ", data);
                    // let { valid, data } = handleSuccessResponse(res, responseCodes.successCode)

                    // if (!valid || !data) throw new Error("Invalid response")

                    let pageToken = last
                    if (data.length > 0) {
                        pageToken = data[data.length - 1][itemId];
                        if (!!filterData) data = filterData(data)
                        if (!!mapActionData) data = data.map(mapActionData);

                        data = searchData(args.query, data);
                        if (last == null) setData(data)
                        else setData(prev => ([...prev, ...data]))
                    }

                    done({ items: data, pageToken: pageToken })

                }).catch(e => {
                    console.log('Unable to load data to table. Exception: ', e);
                    let { valid, msg } = handleErrorResponse(e, responseCodes.errorCodes)
                    done({ items: [], pageToken: last })
                    toast.error(msg)
                })
        })
    }, [model, action, counter])

    let memorizedColumns = React.useMemo(() => {
        let _columns: IDataTableColumn[] = []

        // generate columns 
        for (let col of columns) {
            // disable: col.disable
            if (col.disable) {
                continue
            }

            let _tCol: IDataTableColumn = {
                title: col.name,
                width: col.columnWidth,
                renderColumn: (item: any) => <div>{item[col.valueField]}</div>
            }

            if (col.renderColumn) {
                _tCol.renderColumn = col.renderColumn
            }

            _columns.push(_tCol)
        }


        // if (canEdit || canDelete) {
        _columns.push({
            title: 'Actions',
            width: '',
            renderColumn: (item) => <div className='mda-spa-crud-list-action-column'>
                {/* {
                        canEdit &&
                        <Link to={`${path}/edit/${item[itemId]}`} > */}
                <Button
                    icon={`${editIcon}`}
                    title={labels?.edit || 'Edit'}
                    onClick={() => changeMode('edit')}
                />
                {/* </Link>
                    } */}
                {/* {
                        canDelete && */}
                <Button
                    icon={`${deleteIcon}`}
                    title='Delete'
                    onClick={() => { setDeleteId(item[itemId]) }}
                />
                {/* } */}
            </div>
        })
        // }
        return _columns
    }, [columns])

    let memorizedQuery = React.useMemo(() => {
        return { query: searchQuery }
    }, [searchQuery])


    async function onDeleteItem(id: string) {
        if (deleteItem) {
            let { model, action, responseCodes: deleteResponseCodes } = deleteItem
            try {
                await uxpContext.executeAction(model, action, { _id: id });
                toast.success(`Delete successfully!!!!`)
                setCounter(prev => (prev += 1))
                setDeleteId(null)
            } catch (e) {
                console.log(e);
            }
            // changeMode('list');


        }
        //     uxpContext.executeAction(model, action, { id: id }, { json: true })
        //         .then(res => {
        //             console.log("Response ", res);
        //             let { valid, data } = handleSuccessResponse(res, deleteResponseCodes.successCode)

        //             if (valid) {
        //                 toast.success(deleteResponseCodes.successMessage ? deleteResponseCodes.successMessage : `${entityName} deleted`)
        //                 setCounter(prev => (prev += 1))
        //                 setDeleteId(null)
        //             }
        //             else {
        //                 toast.error("Invalid Response")
        //                 setCounter(prev => (prev += 1))
        //                 setDeleteId(null)
        //             }

        //         })
        //         .catch(e => {
        //             console.log(`Unable to delete ${entityName}. Exception: `, e);
        //             let { valid, msg } = handleErrorResponse(e, deleteResponseCodes.errorCodes)
        //             toast.error(msg)
        //             setDeleteId(null)
        //         })
        // }
        // else {
        //     toast.error("No delete option has configured")
        // }
    }


    function handleExport() {
        try {
            // get column mapping 
            let columnMapping = buttons?.export?.columns || {}
            if (Object.keys(columnMapping).length == 0) {
                toast.error("Invalid columns")
                return
            }

            let excelData = data.map(d => {
                let t: any = {}
                for (let key of Object.keys(columnMapping)) {
                    t[columnMapping[key]] = d[key] || null
                }
                return t
            })

            const fileName = `${entityName}-${format(new Date(), 'yyyy-MM-dd')}`;
            useExportToExcel({ [entityName]: excelData }, fileName);
        }
        catch (e) {
            toast.error("Unable to export. Something went wrong")
        }
    }

    return (<div className={classNames("mda-spa-crud-component-list-container-default", { "has-toolbar": toolbar.show || true })}>

        <div className="toolbar">
            <div className="left">
                {/* {canAdd &&
                    <Link to={path + '/add'}> */}
                <Button
                    className='add-button'
                    title={buttons?.add?.label || labels?.add || "Add"}
                    onClick={() => changeMode('create')}
                    icon={`${plusIcon}`}
                />
                {/* </Link>
                } */}

                {buttons?.export?.show &&
                    <Button
                        title={buttons?.export?.label || "Export to excel"}
                        icon={`${downloadIcon}`}
                        onClick={handleExport}
                    />
                }

                {buttons?.print?.show &&
                    <Button
                        title={buttons?.print?.label || "Print"}
                        icon={`${printIcon}`}
                        onClick={() => { }}
                    />
                }

            </div>
            <div className="right">
                {search?.show &&
                    <FormField className="search-form" inline>
                        <SearchBox
                            value={query || ''}
                            placeholder={`Search ${entityName}`}
                            onChange={(newValue) => { setQuery(newValue) }}
                        />
                    </FormField>
                }
            </div>
        </div>


        <div className={classNames("list-container")}>

            <MemorizedDataTable
                data={getData}
                pageSize={pageSize ?? 20}
                columns={memorizedColumns}
                activeClass="active"
                args={memorizedQuery}
            />

            <ConfirmPopup
                show={deleteId !== null}
                onConfirm={{
                    execute: () => onDeleteItem(deleteId),
                    onComplete: () => {
                    },
                    onError: (e) => {
                    }
                }}
                onCancel={() => setDeleteId(null)}
                message={`Are you sure. You want to delete this ${entityName}?`}
                processingMessage={`Deleting ${entityName}...`}
            />
        </div>
    </div>
    );
}

export default ListView
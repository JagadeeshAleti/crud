import * as React from 'react'
import { Button, FormField, IconButton, IDataTableColumn, Input, SearchBox, useToast } from 'uxp/components';
import { IDefaultUXPProps, IListViewProps } from '../../../../crud-component';
import { debounce, handleErrorResponse } from '../../../utils';
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
    changeMode: any
}

const ListView: React.FunctionComponent<IListProps> = (props) => {

    let { uxpContext, renderCustom: CustomListComponent } = props

    return <div className={classNames("mda-spa-crud-component-list-container")}>
        {
            CustomListComponent
                ? <CustomListComponent uxpContext={uxpContext} />
                : <ListComponent {...props} />
        }
    </div>
}

export const ListComponent: React.FunctionComponent<IListProps> = (props) => {
    let { uxpContext, entityName, model, collection, default: { labels, mapActionData, filterData, columns, pageSize, itemId, toolbar, canCreate, canDelete, canEdit, action: listAction, model: listModel, deleteItem }, renderCustom, changeMode } = props

    let { show: showToolbar, buttons, search } = toolbar

    let toast = useToast()

    const [modelKey, setModelKey] = React.useState('');
    let [deleteId, setDeleteId] = React.useState(null)
    let [counter, setCounter] = React.useState(0)
    const [query, setQuery] = React.useState<string>('');
    const [searchQuery, setSearchQuery] = React.useState<string>('');
    const [data, setData] = React.useState<any[]>([]);


    React.useEffect(() => {
        if (model) {
            getModelKey();
        }
    }, []);

    // update search quey 
    const updateSearchQery = debounce(() => {
        setSearchQuery(query)
    }, 300)

    React.useEffect(() => {
        updateSearchQery()
    }, [query])

    async function getModelKey() {
        try {
            const result = await props.uxpContext.executeService('System', 'MetadataMap:KeyByname', { Name: model });
            const details = JSON.parse(result);
            const { Key } = details[0];
            setModelKey(Key);
        } catch (e) {
            toast.error("Something went wrong!!!")
        }
    };

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

    function setPageToken(last: string, data: any, args: any) {
        let pageToken = last
        if (data.length > 0) {
            pageToken = data[data.length - 1][itemId];
            if (!!filterData) data = filterData(data)
            if (!!mapActionData) data = data.map(mapActionData);

            data = searchData(args.query, data);
            if (last == null) setData(data)
            else setData(prev => ([...prev, ...data]))
        }

        return pageToken;
    };


    let getData = React.useCallback((max: number, last: string, args: any) => {

        return new Promise<{ items: any[], pageToken: string }>((done, nope) => {
            let params: any = { max: max }
            if (last) params.last = last

            if (model && collection) {
                const paramsToService = {
                    collectionName: collection,
                    modelName: model,
                    max: 20,
                    filter: JSON.stringify({})
                };

                uxpContext.executeService("Lucy", "GetPaginatedDocs", paramsToService)
                    .then(response => {
                        const [result] = JSON.parse(response);
                        let data = JSON.parse(result?.data);
                        const pageToken = setPageToken(last, data, args);
                        done({ items: data, pageToken: pageToken })

                    }).catch(e => {
                        console.log('Unable to load data to table. Exception: ', e);
                        done({ items: [], pageToken: last })
                        toast.error('Unable to load data to table. Exception')
                    })
            }

            if (listModel && listAction) {
                uxpContext.executeAction(listModel, listAction, params, { json: true })
                    .then(res => {
                        const pageToken = setPageToken(last, res, args);
                        done({ items: res, pageToken: pageToken })

                    }).catch(e => {
                        console.log('Unable to load data to table. Exception: ', e);
                        done({ items: [], pageToken: last })
                        toast.error('Unable to load data to table. Exception')
                    })
            }


        })
    }, [model, collection, counter])

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
                {canEdit &&
                    <Button
                        icon={`${editIcon}`}
                        title={labels?.edit || 'Edit'}
                        onClick={() => changeMode('edit', item[itemId])}
                    />
                }

                {canDelete &&
                    <Button
                        icon={`${deleteIcon}`}
                        title='Delete'
                        onClick={() => { setDeleteId(item[itemId]) }}
                    />
                }

            </div>
        })
        return _columns
    }, [columns])

    let memorizedQuery = React.useMemo(() => {
        return { query: searchQuery }
    }, [searchQuery])


    async function onDeleteItem(id: string) {
        let { collection } = props;
        try {
            const { model: deleteModel, action: deleteAction  } = deleteItem;
            if(model && collection && !deleteModel && !deleteAction){
                const params = {
                    _id: id,
                    model: modelKey,
                    collection
                }
                await uxpContext.executeService("Lucy", "DeleteDocument", params);
            } else {
                await uxpContext.executeAction(deleteModel, deleteAction, { id: id }, { json: true });
            }
            toast.success(`${entityName} deleted successfully!!!!`)
            setCounter(prev => (prev += 1))
            setDeleteId(null)
        } catch (e) {
            console.log(e);
        }
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
                {canCreate &&
                    <Button
                        className='add-button'
                        title={buttons?.add?.label || labels?.add || "Add"}
                        onClick={() => changeMode('add')}
                        icon={`${plusIcon}`}
                    />
                }

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
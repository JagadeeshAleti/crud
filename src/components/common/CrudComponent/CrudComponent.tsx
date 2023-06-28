import * as React from 'react'
import { ICrudComponentProps } from '../../../../crud-component';


import AddView from './AddView';
import EditView from './EditView';
import ListView from './ListView';

const CrudComponent: React.FunctionComponent<ICrudComponentProps> = (props) => {

    let { uxpContext, entityName, list, add, edit, roles } = props;
    const [mode, setMode] = React.useState('list')

    function changeMode(mode: string) {
        setMode(mode);
    }

    return <div className='mda-spa-crud-component'>
        {mode === 'list' && <ListView {...list} uxpContext={uxpContext} entityName={entityName} roles={roles} changeMode={changeMode} />}
        {mode === 'create' && <AddView {...add} uxpContext={uxpContext} entityName={entityName} />}
        {mode === 'edit' && <EditView {...edit} uxpContext={uxpContext} entityName={entityName} />}

    </div>
}


const MemorizedCRUDComponent: React.FunctionComponent<ICrudComponentProps> = (props) => {
    return <CrudComponent {...props} />
}

export default React.memo(MemorizedCRUDComponent)
import * as React from 'react'
import { ICrudComponentProps } from '../../../../crud-component';


import AddView from './AddView';
import EditView from './EditView';
import ListView from './ListView';

const CrudComponent: React.FunctionComponent<ICrudComponentProps> = (props) => {

    let { uxpContext, entityName,list, add, edit, model, collection } = props;

    const [id, setId] = React.useState(null);
    const [mode, setMode] = React.useState<'list' | 'add' | 'edit'>('list');

    function changeMode(m: 'list' | 'add' | 'edit', id: string) {
        console.log(`Changing mode from ${mode} to ${m}`);
        setMode(m);
        if (id) {
            setId(id);
        }
    }

    return <div className='mda-spa-crud-component'>
        {mode === 'list' && <ListView {...list} uxpContext={uxpContext} entityName={entityName} changeMode={changeMode} model={model} collection={collection} />}
        {mode === 'add' && <AddView {...add} uxpContext={uxpContext} entityName={entityName} changeMode={changeMode} model={model} collection={collection} />}
        {mode === 'edit' && <EditView {...edit} uxpContext={uxpContext} entityName={entityName} changeMode={changeMode} id={id} model={model} collection={collection} />}

    </div>
}


const MemorizedCRUDComponent: React.FunctionComponent<ICrudComponentProps> = (props) => {
    return <CrudComponent {...props} />
}

export default React.memo(MemorizedCRUDComponent)
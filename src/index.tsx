import * as React from "react";
import { IContextProvider, registerWidget, } from './uxp';


import './assets/styles/styles.scss';
import Widget1 from "./Widget1";


interface IWidgetProps {
    uxpContext?: IContextProvider,
    instanceId?: string
}

registerWidget({
    id: 'widget1',
    widget: Widget1
})


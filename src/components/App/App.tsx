import * as React from 'react'
import { HashRouter as Router, Redirect, Route, Switch } from "react-router-dom";
import { IContextProvider } from '../../uxp';
import Header from '../common/Header';
import Sidebar from '../common/Sidebar';

import ExtendedRoute from '../common/ExtendedRoute';
// import PageNotFound from '../common/Error/PageNotFound';
import { loadAllRoles } from '../../role-manager';

export interface IMenuItem {
    name: string,
    link: string,
    iconPath?: string,
    roles?: string[],
    component: React.FC<any> | null
}

export const MenuItems: IMenuItem[] = []

interface IAppProps {
    uxpContext: IContextProvider
}


const App: React.FunctionComponent<IAppProps> = (props) => {

    let { uxpContext } = props
    let [ loadingRoles, setLoadingRoles ] = React.useState<boolean>(true);

    React.useEffect(() => {
        loadAllRoles(props.uxpContext)
            .then((roles) => console.log('Loaded roles:', roles))
            .catch(err => console.error(`Error loading roles: ${err}`))
            .finally(() => setLoadingRoles(false));
    }, [props.uxpContext])

    if (loadingRoles) {
        return <div />;
    }

    return (
        <div className="mda-spa-web-ui-container">
            <Router>
                <Sidebar menuItems={MenuItems} uxpContext={props.uxpContext} />

                <div className="main">

                    <Header uxpContext={props.uxpContext} title="Raseel Smart Parking Platform" />

                    <Switch>

                        <Route exact path={"/"} >
                            <Redirect to={'/landing-page'} />
                        </Route>

                        {
                            MenuItems.map((m, k) => {
                                let Component = m.component

                                return <ExtendedRoute uxpContext={uxpContext} roles={m.roles || []} path={m.link} >
                                    {Component && <Component uxpContext={uxpContext} />}
                                </ExtendedRoute>

                            })
                        }

                        {/* < Route >
                            <PageNotFound />
                        </Route > */}
                    </Switch >
                </div >
            </Router >

        </div >
    )
}

export default App;

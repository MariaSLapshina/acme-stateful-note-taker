    const { Link, Route, Switch, Redirect, HashRouter} = ReactRouterDOM;
    const { Component }  = React;
    const { render } = ReactDOM;
    const root = document.querySelector("#root");


    const Nav =  ({path,notes}) =>{
        const notesCount = notes.length;
        const arcCount = notes.reduce((acc,curnote) => {
            if(curnote.archived){
                acc++;
            }
            return acc;
        },0)

        return (
            <nav>
                <Link to ="/notes" className = {path === "/notes" ? 'selected' : ''}>Notes ({notesCount})</Link>
                <Link to= "/archived" className = {path === "/archived" ? 'selected' : ''}>Archived ({arcCount})</Link>
                <Link to = "/notes/create" className = {path === "/notes/create" ? 'selected' : ''}>Create</Link>
            </nav>
        )
    }
    
    class App extends Component{
        constructor(){
            super();
            this.state = {
                user: {},
                notes: []
            }
        }
        
        async componentDidMount(){
            const user = await fetchUser();
            const notes = await fetchNotes(user.id);
            this.setState({user, notes});
        }
        render(){
            const { notes, user } = this.state;
            return (
            <HashRouter>
                <Route render ={({location})=> <Nav path = {location.pathname} notes = {notes}/>}/>
                <h1>Acme Note-taker for {user.fullName}</h1>
                <Switch>
                <Route exact path = '/notes'/>
                <Route exact path = '/archived'/>
                <Route exact path = '/notes/create'/>
                </Switch>
            </HashRouter>
            )
        }
    }

    render(<App/>, root)
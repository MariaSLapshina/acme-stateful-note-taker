const { Link, Route, Switch, Redirect, HashRouter } = ReactRouterDOM
const { Component } = React
const { render } = ReactDOM
const root = document.querySelector("#root")


const Nav = ({ path, notes }) => {
    const notesCount = notes.reduce((acc, curnote) => {
        if (!curnote.archived) acc++
        return acc
    }, 0);
    const arcCount = notes.reduce((acc, curnote) => {
        if (curnote.archived) acc++
        return acc
    }, 0)
    return (
        <nav>
            <Link to="/notes" className={path === "/notes" ? 'selected' : ''}>Notes ({notesCount})</Link>
            <Link to="/archived" className={path === "/archived" ? 'selected' : ''}>Archived ({arcCount})</Link>
            <Link to="/notes/create" className={path === "/notes/create" ? 'selected' : ''}>Create</Link>
        </nav>
    )
}

const Notes = ({ notes, onUpdateNote, onDestroyNote }) => {
    const unarchived = notes.filter((note) => !note.archived)
    return (
        <ul>
            { unarchived.map(note => {
                return (
                    <li key={ note.id }>
                        { note.text }
                        <button onClick={() => onUpdateNote(note.id, true, note.text)}>archive</button>
                        <button onClick={() => onDestroyNote(note.id)}>destroy</button>
                    </li>
                )
            })}
        </ul>
    )
}

const Archived = ({ notes, onUpdateNote, onDestroyNote }) => {
    const archived = notes.filter((note) => note.archived)
    return (
        <ul>
            { archived.map(note => {
                return (
                    <li key={ note.id }>
                        { note.text }
                        <button onClick={() => onUpdateNote(note.id, false, note.text)}>unarchive</button>
                        <button onClick={() => onDestroyNote(note.id)}>destroy</button>
                    </li>
                )
            })}
        </ul>
    )
}

class Create extends Component {
    constructor() {
        super()
        this.state = {
            text: ''
        }
        this.onTextUpdate = this.onTextUpdate.bind(this)
    }
    onTextUpdate(text){
    this.setState({text})
    }
    render () {
        const { text } = this.state;
        return (
            <div>
            <input type = 'text' value = {text} onChange = {(ev)=> this.onTextUpdate(ev.target.value)}/>
            <button disabled = {!text}>Create</button>
            </div>
        )
    }
}

class App extends Component {
    constructor() {
        super()
        this.state = {
            user: {},
            notes: []
        }
        this.onUpdateNote = this.onUpdateNote.bind(this)
        this.onDestroyNote = this.onDestroyNote.bind(this)
    }
    async componentDidMount() {
        const user = await fetchUser()
        const notes = await getNotes(user.id)
        this.setState({ user, notes })
    }
    async onUpdateNote(noteId, archived, text) {
        const userId = this.state.user.id
        const { notes } = this.state
        const updated = await putNotes({userId, noteId, archived, text})
        const updateNotes = notes.map(note => note.id === updated.id ? updated : note)
        this.setState({ notes: updateNotes })
    }
    async onDestroyNote(noteId) {
        const userId = this.state.user.id
        const { notes } = this.state
        const updateNotes = notes.filter(note => note.id !== noteId)
        deleteNotes({ userId, noteId })
        this.setState({ notes: updateNotes })
    }
    async onCreateNote(archived, text){
        const userId = this.state.user.id;
        const newNote = await postNotes({userId, archived, text})
        
    }

    render() {
        const { notes, user } = this.state
        return (
            <HashRouter>
                <Route render={({ location }) => <Nav path={location.pathname} notes={notes} />} />
                <h1>Acme Note-taker for {user.fullName}</h1>
                <Switch>
                    <Route exact path='/notes' render={() => <Notes notes={notes} onUpdateNote={this.onUpdateNote} onDestroyNote={this.onDestroyNote}/>}/>
                    <Route exact path='/archived' render={() => <Archived notes={notes} onUpdateNote={this.onUpdateNote} onDestroyNote={this.onDestroyNote}/>}/>}/>
                    <Route exact path='/notes/create' render={() => <Create notes = { notes } />}/>
                </Switch>
            </HashRouter>
        )
    }
}

render(<App />, root)
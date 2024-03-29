const { Link, Route, Switch, Redirect, HashRouter } = ReactRouterDOM
const { Component } = React
const { render } = ReactDOM
const root = document.querySelector("#root")


const Nav = ({ path, notes }) => {
    const notesCount = notes.reduce((acc, curnote) => {
        if (!curnote.archived) acc++
        return acc
    }, 0);
    const arcCount = notes.length - notesCount
    return (
        <nav>
            <Link to="/notes" className={path === "/notes" ? 'selected' : ''}>Notes ({notesCount})</Link>
            <Link to="/archived" className={path === "/archived" ? 'selected' : ''}>Archived ({arcCount})</Link>
            <Link to="/notes/create" className={path === "/notes/create" ? 'selected' : ''}>Create</Link>
        </nav>
    )
}

const Notes = ({ notes, isArchived, onUpdateNote, onDestroyNote }) => {
    const filteredNotes = notes.filter((note) => note.archived === isArchived)
    return (
        <ul>
            { filteredNotes.map(note => {
                return (
                    <li key={ note.id }>
                        { note.text }
                        <button onClick={() => onUpdateNote(note.id, !isArchived, note.text)}>{isArchived ? 'unarchive' : 'archive'}</button>
                        <button onClick={() => onDestroyNote(note.id)}>destroy</button>
                    </li>
                )
            })}
        </ul>
    )
}

class Create extends Component {
    state = {
        text: ''
    }
    onTextUpdate = (text) => {
        this.setState({text})
    }
    render () {
        const { text } = this.state
        return (
            <div>
            <input type = 'text' value = {text} onChange = {(ev)=> this.onTextUpdate(ev.target.value)}/>
            <button disabled = {!text} onClick = {() => this.props.onCreateNote(text)}>Create</button>
            </div>
        )
    }
}

class App extends Component {
    state = {
        user: {},
        notes: []
    }

    async componentDidMount() {
        const user = await fetchUser()
        const notes = await getNotes(user.id)
        this.setState({ user, notes })
    }
    onUpdateNote = async (noteId, archived, text) => {
        const userId = this.state.user.id
        const { notes } = this.state
        const updated = await putNotes({userId, noteId, archived, text})
        const updateNotes = notes.map(note => note.id === updated.id ? updated : note)
        this.setState({ notes: updateNotes })
    }
    onDestroyNote = async (noteId) => {
        const userId = this.state.user.id
        const { notes } = this.state
        const updatedNotes = notes.filter(note => note.id !== noteId)
        deleteNotes({ userId, noteId })
        this.setState({ notes: updatedNotes })
    }
    onCreateNote = async (text) => {
        const userId = this.state.user.id;
        const { notes } = this.state
        const newNote = await postNotes({userId, archived: false, text})
        const updatedNotes = [...notes, newNote]
        this.setState({ notes: updatedNotes })
    }

    render() {
        const { notes, user } = this.state
        return (
            <HashRouter>
                <Route render={({ location }) => <Nav path={location.pathname} notes={notes} />} />
                <h1>Acme Note-taker for {user.fullName}</h1>
                <Switch>
                    <Route exact path='/notes' render={() => <Notes isArchived={false} notes={notes} onUpdateNote={this.onUpdateNote} onDestroyNote={this.onDestroyNote}/>}/>
                    <Route exact path='/archived' render={() => <Notes isArchived={true} notes={notes} onUpdateNote={this.onUpdateNote} onDestroyNote={this.onDestroyNote}/>}/>}/>
                    <Route exact path='/notes/create' render={() => <Create onCreateNote={this.onCreateNote} />}/>
                </Switch>
            </HashRouter>
        )
    }
}

render(<App />, root)
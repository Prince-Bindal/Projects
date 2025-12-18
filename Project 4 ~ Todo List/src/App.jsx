import { useState ,useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { v4 as uuidv4 } from 'uuid';
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import Navbar from './components/Navbar'

function App() {
  const [todo, setTodo] = useState("")
  const [todos, setTodos] = useState([])
  const [showFinished, setshowFinished] = useState(true)

 useEffect(() => {
  let todoString = localStorage.getItem("todos")
  if(todoString){
    let todos = JSON.parse(todoString)
    setTodos(todos)
  }
}, [])


useEffect(() => {
  if(todos.length > 0) {
    localStorage.setItem("todos", JSON.stringify(todos))
  }
}, [todos])

const toggleFinished = (e) => {
  setshowFinished(!showFinished)
  
}



  const handleAdd = () => {
    setTodos([...todos, { id: uuidv4(), todo, isComplete: false }])
    setTodo("")
    
  }

  const handleEdit = (e, id) => {
    let t = todos.filter(i => i.id === id)
    setTodo(t[0].todo)
    
      let newTodos = todos.filter(item => {
      return item.id != id
    });
    setTodos(newTodos)
      
  }


  const handleDelete = (e, id) => {

    let newTodos = todos.filter(item => {
      return item.id != id
    });
    setTodos(newTodos)
      
  }


  const handleChange = (e) => {
    setTodo(e.target.value)
     
  }

  const handleCheckbox = (e) => {
    let id = e.target.name;
    let index = todos.findIndex(item => {
      return item.id == id;

    })
    let newTodos = [...todos];
    newTodos[index].isComplete = !newTodos[index].isComplete
    setTodos(newTodos)
    
  }





  return (
    <>
      <Navbar />
      <div className="md:container bg-emerald-100  mx-3 md:mx-auto rounded-xl p-4 my-5 min-h-[80vh]  md:w-[35%]" >
      <h1 className=' font-bold text-3xl text-center'>iTask - Add Your Task</h1>
        <div className="addTodo my-4 flex flex-col gap-3">
          <h2 className='text-lg font-bold'>Add Todo</h2>
          <div className="flex gap-2">

          <input onChange={handleChange} value={todo} type="text" className='bg-white  rounded-full px-5 py-1 w-full' />
          <button onClick={handleAdd} disabled={todo.length<=3} className='bg-emerald-600 px-3 py-1.5 mx-2 text-sm font-bold text-white hover:bg-emerald-900 cursor-pointer  rounded-lg '>Save</button>
          </div>
        </div>
        <input type="checkbox" onChange={toggleFinished} checked={showFinished}  /> Show Finished
        <hr className='text-gray-400 my-3' />
        <h2 className='flex text-lg font-bold my-3' >Your Todos</h2>

        <div className="todos">
          {todos.length === 0 && <div className='m-5'>No Todos to display</div>}
          {todos.map(item => {


            return (showFinished || !item.isComplete) && <div key={item.id} className="todo my-3 flex md:w-full justify-between">
              <div className='flex  gap-3 '>

                <input name={item.id} onChange={handleCheckbox} type="checkbox" checked={item.isComplete} id="" />
                <div className={`  whitespace-normal max-w-[100%] ${item.isComplete ? "line-through" : ""}`}>
{item.todo}</div>
              </div>

              <div className="button flex h-full">
                <button onClick={(e) => handleEdit(e, item.id)} className='bg-emerald-700 px-3 py-1.5 text-sm font-bold text-white hover:bg-emerald-900 cursor-pointer  rounded-lg mx-1'><FaEdit />

                </button>
                <button onClick={(e) => { handleDelete(e, item.id) }} className='bg-emerald-700 px-3 py-1.5 text-sm font-bold text-white hover:bg-emerald-900 cursor-pointer  rounded-lg mx-1'><MdDelete /></button>

              </div>

            </div>
          })}
        </div>

      </div>
    </>
  )
}

export default App

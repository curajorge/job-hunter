import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  IconButton, 
  Checkbox 
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';

function Todos() {
  const [todos, setTodos] = useState(() => {
    const storedTodos = localStorage.getItem('todos');
    return storedTodos ? JSON.parse(storedTodos) : [];
  });
  const [todo, setTodo] = useState('');
  const [editing, setEditing] = useState(null);
  const [currentTodo, setCurrentTodo] = useState('');

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const handleChange = (e) => {
    setTodo(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTodos([...todos, { text: todo, completed: false }]);
    setTodo('');
  };

  const deleteTodo = (index) => {
    const newTodos = [...todos];
    newTodos.splice(index, 1);
    setTodos(newTodos);
  };

  const editTodo = (index) => {
    setEditing(index);
    setCurrentTodo(todos[index].text);
  };

  const saveTodo = (index) => {
    const newTodos = [...todos];
    newTodos[index].text = currentTodo;
    setTodos(newTodos);
    setEditing(null);
    setCurrentTodo('');
  };

  const toggleComplete = (index) => {
    const newTodos = [...todos];
    newTodos[index].completed = !newTodos[index].completed;
    setTodos(newTodos);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Todo List
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="New Todo"
          value={todo}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        <Button type="submit" variant="contained" color="primary">
          Add Todo
        </Button>
      </form>
      <List>
        {todos.map((todo, index) => (
          <ListItem key={index} dense secondaryAction={
            <>
              <IconButton edge="end" aria-label="edit" onClick={() => editTodo(index)}>
                <EditIcon />
              </IconButton>
              <IconButton edge="end" aria-label="delete" onClick={() => deleteTodo(index)}>
                <DeleteIcon />
              </IconButton>
            </>
          }>
            {editing === index ? (
              <TextField
                value={currentTodo}
                onChange={(e) => setCurrentTodo(e.target.value)}
                onBlur={() => saveTodo(index)}
                autoFocus
              />
            ) : (
              <>
                <Checkbox
                  checked={todo.completed}
                  onChange={() => toggleComplete(index)}
                />
                <ListItemText primary={todo.text} style={{ textDecoration: todo.completed ? 'line-through' : 'none' }} />
              </>
            )}
          </ListItem>
        ))}
      </List>
    </Container>
  );
}

export default Todos;

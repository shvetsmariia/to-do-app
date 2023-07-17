import { useState, useEffect, useRef } from 'react';
import { Alert, AlertTitle } from '@mui/material';
import ButtonGroup from '@mui/material/ButtonGroup';
import AddTaskOutlinedIcon from '@mui/icons-material/AddTaskOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import DoneIcon from '@mui/icons-material/Done';
import FlagIcon from '@mui/icons-material/Flag';
import {
  Container,
  List,
  Box,
  TextField,
  Typography,
  Button,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Grid,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';

function App() {
  const [list, setList] = useState(JSON.parse(localStorage.getItem("list")) || []);
  const [itemToAdd, setItemToAdd] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  const [editIndex, setEditIndex] = useState(-1);
  const [editItemName, setEditItemName] = useState("");
  const [filterOption, setFilterOption] = useState("all");
  const editItemRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("list", JSON.stringify(list));
  }, [list]);

  const handleSubmit = () => {
    if (itemToAdd.trim()) {
      setList([
        ...list,
        {
          itemName: itemToAdd,
          itemStatus: false,
          priority: false
        },
      ]);
      setItemToAdd("");
      setShowWarning(false);
    } else {
      setShowWarning(true);
    }
  };

  const handleEdit = (index) => {
    setEditIndex(index);
    setEditItemName(list[index].itemName);
    setShowWarning(false);
  };

  const handleEditChange = (event) => {
    setEditItemName(event.target.value);
  };

  const handleEditSave = (index) => {
    if (editItemName.trim()) {
      const updatedList = [...list];
      updatedList[index].itemName = editItemName;
      setList(updatedList);
      setEditIndex(-1);
      setEditItemName("");
      setShowWarning(false); // Reset the warning state
      localStorage.setItem("list", JSON.stringify(updatedList));
    } else {
      editItemRef.current.focus();
      editItemRef.current.value = "";
      setShowWarning(true);
    }
  };

  const handleClickComplete = (index) => {
    const updatedList = [...list];
    const item = updatedList[index];
    item.itemStatus = !item.itemStatus;
    setList(updatedList);
    localStorage.setItem("list", JSON.stringify(updatedList));
  };

  const handleClickDelete = (index) => {
    const updatedList = [...list];
    updatedList.splice(index, 1);
    setList(updatedList);
    setEditIndex(-1);
    setEditItemName("");
    setShowWarning(false); // Reset the warning state
    localStorage.setItem("list", JSON.stringify(updatedList));
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSubmit();
    }
  };

  const handlePriorityToggle = (index) => {
    const updatedList = [...list];
    const item = updatedList[index];
    item.priority = !item.priority;
  
    // Update the priority of the clicked item and adjust the order of other items
    if (item.priority) {
      // Move the item to the top
      updatedList.splice(index, 1);
      updatedList.unshift(item);
    } else {
      // Move the item to its original position based on priority
      const priorityItems = updatedList.filter((item) => item.priority);
      const nonPriorityItems = updatedList.filter((item) => !item.priority);
      updatedList.length = 0;
      updatedList.push(...priorityItems, ...nonPriorityItems);
    }
  
    setList(updatedList);
    localStorage.setItem("list", JSON.stringify(updatedList));
  };  

  const handleFilterChange = (event) => {
    setFilterOption(event.target.value);
  };

  const filteredList = list.filter((item) => {
    if (filterOption === "all") {
      return true;
    } else if (filterOption === "completed") {
      return item.itemStatus;
    } else if (filterOption === "uncompleted") {
      return !item.itemStatus;
    } else if (filterOption === "priority") {
      return item.priority;
    }
    return true;
  });

  // Sort priority tasks to the top
  const sortedList = [...filteredList].sort((a, b) => {
    if (a.priority && !b.priority) {
      return -1;
    } else if (!a.priority && b.priority) {
      return 1;
    } else {
      return 0;
    }
  });

  return (
    <Container maxWidth="md">
      <Typography variant="h2" mt={10} mb={2} textAlign={"center"} gutterBottom>
        To-Do List Tracker:
      </Typography>
      <Grid container mb={2} spacing={2} justifyContent={"center"} alignItems={"flex-end"}>
        <Grid item xs={12} sm={8}>
          <TextField
            required
            value={itemToAdd}
            onChange={(event) => {
              setItemToAdd(event.target.value);
              setShowWarning(false);
            }}
            onKeyPress={handleKeyPress}
            fullWidth
            label="Add New Task"
            variant="standard"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Button fullWidth variant="contained" color="success" onClick={handleSubmit}>
            Add to List
          </Button>
        </Grid>
      </Grid>
      {showWarning && (
        <Alert severity="warning" style={{ display: editIndex === -1 && itemToAdd.trim() === '' ? "flex" : "none", alignItems: "center" }}>
          <AlertTitle style={{ marginRight: "8px", display: "inline" }}>Enter valid text.</AlertTitle>
        </Alert>
      )}
      <Box sx={{ mb: 2 }}>
        <FormControl fullWidth variant="standard">
          <InputLabel>Filter</InputLabel>
          <Select value={filterOption} onChange={handleFilterChange}>
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="uncompleted">Uncompleted</MenuItem>
            <MenuItem value="priority">Priority</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <List>
        {sortedList.map(({ itemName, itemStatus, priority }, index) => {
          return (
            <ListItem key={index} disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <AddTaskOutlinedIcon />
                </ListItemIcon>
                {editIndex === index ? (
                  <TextField
                    fullWidth
                    inputRef={editItemRef}
                    value={editItemName}
                    onChange={handleEditChange}
                    variant="standard"
                    error={showWarning && !editItemName.trim()}
                    helperText={showWarning && !editItemName.trim() ? "Edit valid text" : ""}
                    InputProps={{ style: { color: showWarning && !editItemName.trim() ? "red" : "inherit" } }}
                  />
                ) : (
                  <ListItemText primary={itemName} sx={itemStatus ? { textDecoration: "line-through" } : {}} />
                )}
                <ButtonGroup variant="text" aria-label="text button group" sx={{ justifyContent: "flex-end" }}>
                  {editIndex === index ? (
                    <Tooltip title="Edit">
                      <Button size="small" variant="text" color="success" onClick={() => handleEditSave(index)}>
                        <DoneIcon />
                      </Button>
                    </Tooltip>
                  ) : (
                    <>
                      <Tooltip title="Edit">
                        <Button size="small" variant="text" color="secondary" onClick={() => handleEdit(index)}>
                          <EditIcon />
                        </Button>
                      </Tooltip>
                      <Tooltip title="Completed">
                        <Button size="small" variant="text" color="success" onClick={() => handleClickComplete(index)}>
                          <DoneIcon />
                        </Button>
                      </Tooltip>
                    </>
                  )}
                  <Tooltip title="Delete">
                    <Button size="small" variant="text" color="error" onClick={() => handleClickDelete(index)}>
                      <DeleteIcon />
                    </Button>
                  </Tooltip>
                  <Tooltip title={priority ? "Priority" : "Not Priority"}>
                    <Button
                      size="small"
                      variant="text"
                      color={priority ? "warning" : "inherit"}
                      onClick={() => handlePriorityToggle(index)}
                    >
                      <FlagIcon />
                    </Button>
                  </Tooltip>
                </ButtonGroup>
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      {!!list.length && (
        <Button
          onClick={() => {
            setList([]);
            setEditIndex(-1);
            setEditItemName("");
            localStorage.removeItem("list");
          }}
        >
          Clear All
        </Button>
      )}
    </Container>
  );
}

export default App;
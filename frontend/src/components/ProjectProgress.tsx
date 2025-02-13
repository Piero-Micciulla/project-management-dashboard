import React from "react";
import { Box, Typography, LinearProgress, Grid, Paper } from "@mui/material";

interface ProjectProgressProps {
  totalTickets: number;
  todoCount: number;
  inProgressCount: number;
  doneCount: number;
}

const ProjectProgress: React.FC<ProjectProgressProps> = ({ totalTickets, todoCount, inProgressCount, doneCount }) => {
  const completionPercentage = totalTickets > 0 ? (doneCount / totalTickets) * 100 : 0;

  return (
    <Paper sx={{ p: 3, mt: 4, textAlign: "center", boxShadow: 3, borderRadius: 2 }}>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Project Progress
      </Typography>

      <Grid container spacing={2} justifyContent="center">
        <Grid item xs={4}>
          <Typography variant="body2" color="textSecondary">📝 To Do</Typography>
          <Typography variant="h6">{todoCount}</Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography variant="body2" color="textSecondary">🚧 In Progress</Typography>
          <Typography variant="h6">{inProgressCount}</Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography variant="body2" color="textSecondary">✅ Done</Typography>
          <Typography variant="h6">{doneCount}</Typography>
        </Grid>
      </Grid>

      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="textSecondary">Completion: {completionPercentage.toFixed(0)}%</Typography>
        <LinearProgress variant="determinate" value={completionPercentage} sx={{ mt: 1, height: 10, borderRadius: 5 }} />
      </Box>
    </Paper>
  );
};

export default ProjectProgress;

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/organizacoes', require('./routes/organizacoes'));
app.use('/api/gestores', require('./routes/gestores'));
app.use('/api/projetos', require('./routes/projetos'));
app.use('/api/stakeholders', require('./routes/stakeholders'));
app.use('/api/valores', require('./routes/valores'));
app.use('/api/beneficios', require('./routes/beneficios'));
app.use('/api/propagacoes', require('./routes/propagacao'));
app.use('/api/sinergias', require('./routes/sinergia'));
app.use('/api/revisoes', require('./routes/revisoes'));

app.listen(PORT, () => {
  console.log(`SDG-VBS Server running on http://localhost:${PORT}`);
});

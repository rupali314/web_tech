const router = require('express').Router();
const auth = require('../middleware/auth');
const Child = require('../models/Child');

const DEFAULT_VACCINES = [
  { name: 'BCG',         dueAt: 'At birth' },
  { name: 'Hepatitis B', dueAt: 'At birth' },
  { name: 'OPV Dose 1',  dueAt: '6 weeks'  },
  { name: 'OPV Dose 2',  dueAt: '10 weeks' },
  { name: 'OPV Dose 3',  dueAt: '14 weeks' },
  { name: 'DTP Dose 1',  dueAt: '6 weeks'  },
  { name: 'DTP Dose 2',  dueAt: '10 weeks' },
  { name: 'DTP Dose 3',  dueAt: '14 weeks' },
  { name: 'MMR',         dueAt: '12 months'},
  { name: 'Typhoid',     dueAt: '2 years'  },
];

// GET all children for logged-in user
router.get('/', auth, async (req, res) => {
  const children = await Child.find({ user: req.user.id });
  res.json(children);
});

// POST create a child
router.post('/', auth, async (req, res) => {
  const { name, dob, gender } = req.body;
  const child = await Child.create({
    user: req.user.id, name, dob, gender,
    vaccines: DEFAULT_VACCINES,
  });
  res.json(child);
});

// PUT update a child's info
router.put('/:id', auth, async (req, res) => {
  const child = await Child.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    req.body,
    { new: true }
  );
  res.json(child);
});

// DELETE a child
router.delete('/:id', auth, async (req, res) => {
  await Child.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  res.json({ msg: 'Child deleted' });
});

// PATCH update a single vaccine status
router.patch('/:childId/vaccines/:vaccineId', auth, async (req, res) => {
  const child = await Child.findOne({ _id: req.params.childId, user: req.user.id });
  const vaccine = child.vaccines.id(req.params.vaccineId);
  Object.assign(vaccine, req.body);
  await child.save();
  res.json(child);
});

module.exports = router;
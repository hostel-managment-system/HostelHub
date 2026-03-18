const Feedback = require("../models/Feedback");

exports.createFeedback = async (req, res) => {
  try {
    const { message, category } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message required" });
    }

    await Feedback.create({
      student: req.user._id,
      message,
      category,
    });

    res.status(201).json({ message: "Submitted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMyFeedback = async (req, res) => {
  try {
    const list = await Feedback.find({ student: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json(list);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllFeedback = async (req, res) => {
  try {
    const list = await Feedback.find()
      .populate("student", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(list);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.closeFeedback = async (req, res) => {
  try {
    const fb = await Feedback.findById(req.params.id);

    if (!fb) return res.status(404).json({ message: "Not found" });

    fb.status = "closed";
    await fb.save();

    res.status(200).json({ message: "Closed" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

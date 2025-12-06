 exports.getTicker = async (req, res) => {
  try {
    res.json({
      ticker: [
        { label: "GOLD 24K", value: "₹6120", direction: "up" },
        { label: "SILVER", value: "₹76", direction: "down" },
        { label: "USD-INR", value: "83.10", direction: "up" },
        { label: "GOLD FUTURE", value: "130655", direction: "down" }
      ]
    });
  } catch {
    res.status(500).json({ error: "Server Error" });
  }
};

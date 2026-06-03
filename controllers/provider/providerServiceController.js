// controllers/providerServiceController.js

const Provider = require("../../models/Provider");

// @desc    Get all custom services & base rates of a provider
// @route   GET /api/provider/services
// @access  Private (Provider Only)
exports.getProviderServices = async (req, res) => {
  try {
    // Assuming req.user.id is attached from an authentication middleware
    const provider = await Provider.findById(req.user.id).select(
      "services perDayPrice overtimeHourlyPrice"
    );

    if (!provider) {
      return res.status(404).json({ success: false, message: "Provider not found" });
    }

    res.status(200).json({
      success: true,
      data: {
        services: provider.services,
        perDayPrice: provider.perDayPrice,
        overtimeHourlyPrice: provider.overtimeHourlyPrice,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add a new sub-service to the provider's profile
// @route   POST /api/provider/services
// @access  Private (Provider Only)
exports.addService = async (req, res) => {
  try {
    const { name, price, description, durationInMins } = req.body;

    if (!name || !price) {
      return res.status(400).json({ success: false, message: "Name and Price are required" });
    }

    const provider = await Provider.findById(req.user.id);
    if (!provider) {
      return res.status(404).json({ success: false, message: "Provider not found" });
    }

    // Push new service object into subdocument array
    provider.services.push({ name, price, description, durationInMins });
    await provider.save();

    res.status(201).json({
      success: true,
      message: "Service added successfully",
      data: provider.services,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a specific sub-service by its ID
// @route   PUT /api/provider/services/:serviceId
// @access  Private (Provider Only)
exports.updateService = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { name, price, description, durationInMins } = req.body;

    const provider = await Provider.findById(req.user.id);
    if (!provider) {
      return res.status(404).json({ success: false, message: "Provider not found" });
    }

    // Find subdocument inside array
    const service = provider.services.id(serviceId);
    if (!service) {
      return res.status(404).json({ success: false, message: "Specific service not found" });
    }

    // Apply adjustments
    if (name) service.name = name;
    if (price !== undefined) service.price = price;
    if (description) service.description = description;
    if (durationInMins) service.durationInMins = durationInMins;

    await provider.save();

    res.status(200).json({
      success: true,
      message: "Service updated successfully",
      data: provider.services,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a specific sub-service
// @route   DELETE /api/provider/services/:serviceId
// @access  Private (Provider Only)
exports.deleteService = async (req, res) => {
  try {
    const { serviceId } = req.params;

    const provider = await Provider.findById(req.user.id);
    if (!provider) {
      return res.status(404).json({ success: false, message: "Provider not found" });
    }

    // Check presence before extraction attempt
    const service = provider.services.id(serviceId);
    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    // Pull out subdocument
    provider.services.pull(serviceId);
    await provider.save();

    res.status(200).json({
      success: true,
      message: "Service removed successfully",
      data: provider.services,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update baseline global configurations (Per Day & Overtime rates)
// @route   PATCH /api/provider/prices/base-rates
// @access  Private (Provider Only)
exports.updateGlobalBaseRates = async (req, res) => {
  try {
    const { perDayPrice, overtimeHourlyPrice } = req.body;

    const updateFields = {};
    if (perDayPrice !== undefined) updateFields.perDayPrice = perDayPrice;
    if (overtimeHourlyPrice !== undefined) updateFields.overtimeHourlyPrice = overtimeHourlyPrice;

    const provider = await Provider.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select("perDayPrice overtimeHourlyPrice");

    if (!provider) {
      return res.status(404).json({ success: false, message: "Provider not found" });
    }

    res.status(200).json({
      success: true,
      message: "Base pricing structure modified successfully",
      data: provider,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// controllers/addressController.js
const Address = require("../../models/Address");
const User = require("../../models/User");

// @desc    Add a new delivery address
// @route   POST /api/addresses
// @access  Private
exports.addAddress = async (req, res) => {
    try {
        const userId = req.user.id; // Assumes your auth middleware populates req.user
        const addressData = { ...req.body, user: userId };

        // If this new address is set as default, unset previous default addresses
        if (addressData.isDefault === true || addressData.isDefault === 'true') {
            await Address.updateMany({ user: userId }, { isDefault: false });
        } else {
            // If it's the user's very first address, make it the default automatically
            const existingAddressCount = await Address.countDocuments({ user: userId });
            if (existingAddressCount === 0) {
                addressData.isDefault = true;
            }
        }

        // 1. Create and save the address document
        const newAddress = new Address(addressData);
        const savedAddress = await newAddress.save();

        // 2. Push the address ID into the User record
        await User.findByIdAndUpdate(userId, {
            $push: { addresses: savedAddress._id }
        });

        res.status(201).json({
            success: true,
            message: "Address added successfully",
            data: savedAddress
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server Error: Could not add address",
            error: error.message
        });
    }
};

// @desc    Get all addresses for the logged-in user
// @route   GET /api/addresses
// @access  Private
exports.getAddresses = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Sorts by default first, then by most recently updated
        const addresses = await Address.find({ user: userId }).sort({ isDefault: -1, updatedAt: -1 });

        res.status(200).json({
            success: true,
            count: addresses.length,
            data: addresses
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error: Could not fetch addresses",
            error: error.message
        });
    }
};

// @desc    Update an existing address
// @route   PUT /api/addresses/:id
// @access  Private
exports.updateAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const addressId = req.params.id;

        // Verify the address belongs to the logged-in user before editing
        let address = await Address.findOne({ _id: addressId, user: userId });

        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Address not found or unauthorized to edit"
            });
        }

        // If toggling this address to default, remove default status from all other addresses
        if (req.body.isDefault === true || req.body.isDefault === 'true') {
            await Address.updateMany({ user: userId, _id: { $ne: addressId } }, { isDefault: false });
        }

        // Update the document
        address = await Address.findByIdAndUpdate(
            addressId,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: "Address updated successfully",
            data: address
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error: Could not update address",
            error: error.message
        });
    }
};

// @desc    Delete an address
// @route   DELETE /api/addresses/:id
// @access  Private
exports.deleteAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const addressId = req.params.id;

        // Locate and remove the address document
        const address = await Address.findOneAndDelete({ _id: addressId, user: userId });

        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Address not found or unauthorized to delete"
            });
        }

        // Remove the address reference from the User array
        await User.findByIdAndUpdate(userId, {
            $pull: { addresses: addressId }
        });

        // Optional: If the deleted address was the default one, assign a new default address
        if (address.isDefault) {
            const nextAddress = await Address.findOne({ user: userId });
            if (nextAddress) {
                nextAddress.isDefault = true;
                await nextAddress.save();
            }
        }

        res.status(200).json({
            success: true,
            message: "Address deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error: Could not delete address",
            error: error.message
        });
    }
};
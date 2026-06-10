// controllers/user/userCompanyController.js
const Company = require("../../models/Company");
const Worker = require("../../models/Worker");

/**
 * @desc    Get all active and approved companies with optional filters, search, and geo-location
 * @route   GET /api/v1/user/companies
 * @access  Public/Protected
 */
exports.getAllCompanies = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      service, 
      lat, 
      lng, 
      maxDistance = 25000 // default 25km in meters
    } = req.query;

    // Base query: Only show active and approved companies
    let query = {
      isActive: true,
      verificationStatus: "approved"
    };

    // 1. Text Search (Company Name or Description)
    if (search) {
      query.$text = { $search: search };
    }

    // 2. Filter by Service Type (Looks at what services their workers provide)
    if (service) {
      const workersWithService = await Worker.find({
        serviceProvided: { $regex: service, $options: "i" },
        isActive: true
      }).select("companyId");

      const companyIds = workersWithService.map(w => w.companyId);
      query._id = { $in: companyIds };
    }

    // 3. FIXED: Location-based Search using $geoWithin instead of $near
    if (lat && lng) {
      // Convert maxDistance from meters to Radians (Earth's radius is ~6378.1 km)
      const distanceInRadians = parseFloat(maxDistance) / 6378100;

      query.location = {
        $geoWithin: {
          $centerSphere: [
            [parseFloat(lng), parseFloat(lat)], // [lng, lat]
            distanceInRadians
          ]
        }
      };
    }

    // Pagination configuration
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query with pagination
    const companies = await Company.find(query)
      .select("-password -tokens -refreshToken -bankDetails -gstNumber -panNumber -cinNumber -businessRegistrationNumber")
      .skip(skip)
      .limit(parseInt(limit))
      .sort(search ? { score: { $meta: "textScore" } } : { averageRating: -1 });

    const totalCompanies = await Company.countDocuments(query);

    return res.status(200).json({
      success: true,
      count: companies.length,
      totalPages: Math.ceil(totalCompanies / limit),
      currentPage: parseInt(page),
      data: companies
    });

  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: "Server Error fetching companies",
      error: error.message
    });
  }
};

/**
 * @desc    Get detailed view of a single company along with its available workers
 * @route   GET /api/v1/user/companies/:id
 * @access  Public/Protected
 */
exports.getCompanyDetails = async (req, res) => {
  try {
    const companyId = req.params.id;

    // Find the company and explicitly drop sensitive operational backend details
    const company = await Company.findOne({
      _id: companyId,
      isActive: true,
      verificationStatus: "approved"
    }).select("-password -tokens -refreshToken -bankDetails -gstNumber -panNumber -cinNumber");

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found or is currently inactive"
      });
    }

    // Populate active and available workers attached to this company
    const activeWorkers = await Worker.find({
      companyId: company._id,
      isActive: true,
      isAvailable: true
    }).select("fullName profileImage serviceProvided skills experienceYears designation");

    return res.status(200).json({
      success: true,
      data: {
        company,
        availableWorkers: activeWorkers
      }
    });

  } catch (error) {
    // Catch invalid MongoDB ObjectIds gracefully
    if (error.kind === "ObjectId") {
      return res.status(400).json({
        success: false,
        message: "Invalid Company ID format"
      });
    }
    return res.status(500).json({
      success: false,
      message: "Server Error fetching company details",
      error: error.message
    });
  }
};
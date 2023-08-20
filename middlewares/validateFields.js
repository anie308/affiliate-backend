const validateFields = (requiredFields) => {
    return (req, res, next) => {
      const missingFields = [];
  
      for (const field of requiredFields) {
        if (!(field in req.body)) {
          missingFields.push(field);
        }
      }
  
      if (missingFields.length > 0) {
        return res.status(400).json( {
          error: `Missing fields: ${missingFields.join(', ')}`,
          message: 'Please fill in all required fields'
        } );
      }
  
      next();
    };
  };


  module.exports = { validateFields };
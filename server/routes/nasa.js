import express from 'express';
import HTTP_STATUS from 'http-status-codes';
import axios from 'axios';
import moment from 'moment';
import Neo from '../model/Neo';
import {saveNeo} from '../utils';

const router = express.Router();

let NASA_API_URL = 'https://api.nasa.gov/neo/rest/v1/feed';
let NASA_API_KEY = 'N7LkblDsc5aen05FJqBQ8wU4qSdmsftwJagVK7UD';

/* GET api listing. */
router.get('/', (req, res) => {
  res.json({
    hello: "world",
  });
});

/* GET api listing. */
router.get('/getNeos', (req, res) => {

  const startDate = moment().subtract(3, 'days').startOf('day').format('YYYY-MM-DD');
  const endDate = moment().format('YYYY-MM-DD');

  console.log('startDate', startDate);
  console.log('endDate', endDate);

  axios.get(NASA_API_URL, {
    params: {
      api_key: NASA_API_KEY,
      start_date: startDate,
      end_date: endDate,
      detailed: true,
    }
  })
    .then(function (response) {

      if (response.data && response.data.near_earth_objects) {

        const {near_earth_objects, element_count} = response.data;

        let saveErr = 0;
        Object.keys(near_earth_objects).forEach(date => {

          const neos = near_earth_objects[date];

          /**
           * Iterate Neos;
           */
          neos.forEach(neo => {

            /**
             * Save neo for that date;
             */
            saveNeo(neo, date, err => {
              if (err) {
                console.log('err', err);
                saveErr++;
              }

              console.log('saved', neo.neo_reference_id);
            });
          });
        });

        /**
         * If we can't save some of the neos throw error,
         */
        if (saveErr > 0) {
          return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            errCount: saveErr,
          });
        }

        /**
         * All neos were retrieved
         */
        return res.status(HTTP_STATUS.OK).json({
          elementCount: element_count,
        });

      }
    })
    .catch(function (error) {
      console.log(error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error);
    });
});

router.get('/neo/hazardous', (req, res) => {

  Neo.find({isHazardous: true}, (err, docs) => {

    if (err) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(err);
    }

    res.json(docs);
  });

});

router.get('/neo/fastest', (req, res) => {

  const {hazardous} = req.query;
  const isHazardous = hazardous === 'true';

  Neo.findOne({isHazardous}, null, {$sort: {speed: -1}}, (err, doc) => {

    if (err) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(err);
    }

    res.json(doc);
  });

});

router.get('/neo/best-year', (req, res) => {

  const {hazardous} = req.query;
  const isHazardous = hazardous === 'true';

  const opt = [
    {$match: { isHazardous }},
    {
      $group: {
        _id: {
          $year: "$date"
        },
        count: { $sum: 1 }
      }
    }
  ];

  Neo.aggregate(opt).exec((err, results) => {

    if (err) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(err);
    }

    const bestYear = results.reduce((l, e) => {
      return e.count > l.count ? e : l;
    });

    res.json(bestYear);
  });

});

router.get('/neo/best-month', (req, res) => {

  const {hazardous} = req.query;
  const isHazardous = hazardous === 'true';

  const opt = [
    {$match: { isHazardous }},
    {
      $group: {
        _id: {
          "month": { "$substr": [ "$date", 0, 7 ] }
        },
        count: { $sum: 1 }
      }
    }
  ];

  Neo.aggregate(opt).exec((err, results) => {

    if (err) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(err);
    }

    const bestMonth = results.reduce((l, e) => {
      return e.count > l.count ? e : l;
    });

    res.json(bestMonth);
  });

});

export default router;
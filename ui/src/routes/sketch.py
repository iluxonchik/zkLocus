"""
This represents how the end-user API for zkLocus should work. The code is written as Python 3.

The TypeScript interface should replicate this structure and usage as closely as possible. The goal is to design
an API for zkLocus that is intuitive and easy to use. It should represent the most beautiful APIs in the Python ecosystem,
such as the ones in the BeautifulSoup and the pandas libraries.
"""
from __future__ import annotations
from abc import ABC, abstractmethod
from decimal import Decimal
from collections import namedtuple

number: type = Decimal | float | str | int
RawCoordinates: namedtuple = namedtuple('RawCoordinates', ['latitude', 'longitude'])

class ZKInterface(ABC):
    """
    Represents a direct interface from TypeScript into zkLocus values or data structures. A zkLocus value 
    or a data structure is one that is valid in O1JS. As such, an interface performs a mapping from 
    TypeScript into O1JS.
    """

    @property
    @abstractmethod
    def raw_value(self):
        """
        Returns the raw value of the interface. This is the value that the user provided.
        """
        pass
    
    @property
    @abstractmethod
    def normalized_value(self):
        """
        Returns the normalized value of the interface. This is the value that will be used in the zkSNARK.
        """
        pass

    @abstractmethod
    def to_zkValue(self):
        """
        Performs the convertion from TypeScript into a zkLocus value. A zkLocus value is
        one that can be used in a zero-knowlede circuit. zkLocus uses O1JS to implement zero-knowldge
        circuits, so a zkLocus value is one that is valid in O1JS.
        """
        pass

class ZKNumberToInt64Interface(ZKInterface):
    """
    Concrete implementation of ZKInterface that converts ZKNumbers into Int64.
    """

    def __init__(self, cls: ZKNumber):
        self._cls: ZKNumber = cls

    @property
    def raw_value(self):
        return self._cls.raw_value

    @property
    def normalized_value(self):
        return self._cls.normalized_value

    def to_zkValue(self):
        """
        Converts value from TypeScript's ZKNumber, into O1JS Int64.
        """
        # Implement conversion logic to O1JS Int64 here
        pass

    def __call__(self, *args, **kwargs):
        # Create an instance of the decorated class and return it
        decorated_object = self._cls(*args, **kwargs)
        decorated_object.to_zkValue = self.to_zkValue
        return decorated_object
    
class ZKLocusGeoPointToGeoPoint(ZKInterface):
    """
    Concrete implementation of ZKInterface that converts ZKNumbers into Int64.
    """

    def __init__(self, cls: ZKGeoPoint):
        self._cls: ZKGeoPoint= cls

    @property
    def raw_value(self):
        return self._cls.raw_value

    @property
    def normalized_value(self):
        return self._cls.normalized_value
    

    def to_zkValue(self):
        """
        Converts value from TypeScript's ZkLocusGeoPoint, into O1JS GeoPoint. It uses the properties of the ZkLocusGeoPoint
        to perform the conversion into O1JS GeoPoint.
        """
        # Implement conversion logic to O1JS GeoPoint
        pass

    def __call__(self, *args, **kwargs):
        # Create an instance of the decorated class and return it
        decorated_object = self._cls(*args, **kwargs)
        decorated_object.to_zkValue = self.to_zkValue
        return decorated_object

# It's very important that in the TypeScript API, it's possible to define custom converters from TypeScript into O1JS using this same decorator syntax.
@ZKNumberToInt64Interface
class ZKNumber:
    """
    Represents a number that will be converted to the Fields of a zkSNARK in zkLocus.
    """

    def num_decimals(self):
        """
        Returns the number of decimals in the number.
        """
        return len(str(self._normalized_value).split(".")[1])

    def __init__(self, value: number | ZKNumber):
        self._raw_value: number
        self._normalized_value: Decimal
        if isinstance(value, ZKNumber):
            self._raw_value = value.raw_value
            self._normalized_value: Decimal = value.normalized_value
        else:
            self._raw_value = value
            str_value: str = str(value)
            self._normalized_value = Decimal(str_value)

    @property
    def raw_value(self) -> number:
        """
        Returns the raw value of the number. This is the value that the user provided.
        """
        return self._raw_value
    
    @property
    def normalized_value(self) -> Decimal:
        """
        Returns the normalized value of the number. This is the value that will be used in the zkSNARK.
        """
        return self._normalized_value

class ZKCoordinate(ZKNumber):
    """
    Represents a coordinate that will be converted to the Fields of a zkSNARK in zkLocus.

    It imposes the maximum and the minimum possible values for a coordinate, wether it's latitude or longitude, and
    ensures that the precision limit is not exceeded.
    """
    def __init__(self, value: number| ZKCoordinate):
        value_argument: number

        if isinstance(value, ZKCoordinate):
            value_argument = value.raw_value
        else:
            value_argument = value

        super().__init__(value=value_argument)

        value_as_integer_as: int = abs(int(value))

        if value_as_integer_as > 180:
            raise ValueError("A coordinate must be between -180 and 180")    
        
        if self.num_decimals() > 7:
            raise ValueError("A coordinate must have a maximum of 7 decimals")
        
class ZKLatitude(ZKCoordinate):
    """
    Represents a latitude that will be converted to the Fields of a zkSNARK in zkLocus.
    """
    def __init__(self, value: number | ZKLatitude):
        value_argument: number

        if isinstance(value, ZKLatitude):
            value_argument = value.raw_value
        else:
            value_argument = value

        super().__init__(value=value_argument)

        # ensure that the latitude is between -90 and 90
        value_as_integer_as: int = abs(int(value))

        if value_as_integer_as > 90:
            raise ValueError("A latitude must be between -90 and 90")
        

class ZKLongitude(ZKCoordinate):
    """
    Represents a longitude that will be converted to the Fields of a zkSNARK in zkLocus.
    """
    def __init__(self, value: number):
        super().__init__(value=value)

        # ensure that the longitude is between -180 and 180
        value_as_integer_as: int = abs(int(value))

        if value_as_integer_as > 180:
            raise ValueError("A longitude must be between -180 and 180")

@ZKLocusGeoPointToGeoPoint
class ZKGeoPoint:
    """
    Represents a geographical point in TypeScript that will be converted into a zkLocus geographical point.
    A zkLocus geographical point is one that can be used in a zero-knowledge circuit. zkLocus uses O1JS to
    implement zero-knowledge circuits, so a zkLocus geographical point is one that is represented in a
    valid set of O1JS structures
    """

    def __init__(self, latitude: number | ZKLatitude, longitude: number | ZKLongitude):
        self._latitude: ZKLatitude = latitude
        self._longitude: ZKLongitude = longitude

        if latitude.num_decimals() != longitude.num_decimals():
            print("Warning: The precision of the latitude and longitude are different. The precision of the zkLocusGeoPoint will be the largest of the two.")

            largest_num_decimals: int = max(latitude.num_decimals(), longitude.num_decimals())
            self._latitude = ZKLatitude(value=Decimal(str(latitude.normalized_value)).quantize(Decimal(f"1e-{largest_num_decimals}")))
            self._longitude = ZKLongitude(value=Decimal(str(longitude.normalized_value)).quantize(Decimal(f"1e-{largest_num_decimals}")))

        self._factor: Decimal = Decimal(10 ** self._latitude.num_decimals())
        self._magnitude_latitude: Decimal = self._latitude.normalized_value * self._factor
        self._magnitude_longitude: Decimal = self._longitude.normalized_value * self._factor
        self._is_latitude_positive: bool = self._latitude.normalized_value >= 0
        self._is_longitude_positive: bool = self._longitude.normalized_value >= 0


class ZKThreePointPolygon:

    def __init__(self, vertice1: ZKGeoPoint, vertice2: ZKGeoPoint, vertice3: ZKGeoPoint):
        self._vertice1: ZKGeoPoint = vertice1
        self._vertice2: ZKGeoPoint = vertice2
        self._vertice3: ZKGeoPoint = vertice3

        # ensure all vertices have the same precision, if not, set all to the largest precision

class GeoPointIn3PointPolygonProof:
    """
    Represents a zkLocus proof that a geographical point is inside of a polygon.
    Interface for GeoPointInPolygonCircuit.proveGeoPointIn3PointPolygon(). 
    """ 
    # TODO: interface for GeoPointInPolygonCircuit.proveGeoPointIn3PointPolygon()
    pass 



# Below you can find usage examples. This is how the TypeScript API should look like to the end user.

# Use Case 1: User wants to prove that the coordiantes that they provide are within a three point polygon
def prove_my_coordinates_in_polygon():
    latitude: ZKLatitude = ZKLatitude(40.730610)
    longitude: ZKLongitude = ZKLongitude(-73.935242)
    my_coordinates: ZKGeoPoint = ZKGeoPoint(latitude=latitude, longitude=longitude)
    
    also_my_coordinates: ZKGeoPoint = ZKGeoPoint(latitude=-40.730610, longitude=-73.935242)

    assert my_coordinates == also_my_coordinates

    polygon_vertice_1: ZKGeoPoint = ZKGeoPoint(latitude=40.730610, longitude=-73.935242)
    polygon_vertice_2: ZKGeoPoint = ZKGeoPoint(latitude=ZKLatitude(value=Decimal(40.730610)), longitude=ZKLongitude(value=Decimal(-73.935242)))
    polygon_vertice_3: ZKGeoPoint = ZKGeoPoint(latitude=40.730610, longitude=-73.935242)

    polygon: ZKThreePointPolygon = ZKThreePointPolygon(vertice1=polygon_vertice_1, vertice2=polygon_vertice_2, vertice3=polygon_vertice_3)

    proof: GeoPointIn3PointPolygonProof = my_coordinates.prove_geo_point_in_polygon(polygon=polygon)
    print(f"isProofValid?: {proof.is_proof_valid}")
    print(f"isInside Polygon?: {proof.is_inside_polygon}")
    print(f"JSON: {proof.to_json()}")
   

# Use Case 1: User wants to prove that the coordiantes that they provide are NOT within a three point polygon
def prove_my_coordinates_not_in_polygon():
    # Exactly same approach as in prove_my_coordinates_in_polygon(), just passing the values in a different way

    my_coordinates = ZKGeoPoint(latitude=ZKLatitude(value=Decimal(40.730610)), longitude=ZKLongitude(value=Decimal(-73.935242)))
    polygon = ZKThreePointPolygon(vertice1=ZKGeoPoint(latitude=ZKLatitude(value=Decimal(40.730610)), longitude=ZKLongitude(value=Decimal(-73.935242))), vertice2=ZKGeoPoint(latitude=ZKLatitude(value=Decimal(40.730610)), longitude=ZKLongitude(value=Decimal(-73.935242))), vertice3=ZKGeoPoint(latitude=ZKLatitude(value=Decimal(40.730610)), longitude=ZKLongitude(value=Decimal(-73.935242))))
    proof: GeoPointIn3PointPolygonProof = my_coordinates.prove_geo_point_in_polygon(polygon=polygon)

    my_coordinates = ZKGeoPoint(latitude=40.730610, longitude=-73.935242)
    polygon = ZKThreePointPolygon(vertice1=(12.1232, 21.213), vertice2=(234.2))


    ZKThreePointPolygon(vertice1=(12.12, 122.12))

# Use Case: User wants to prove that their coordinates are inside of a series of polygons
def prove_my_coordinates_in_polygons():
    my_coordinates: ZKGeoPoint = ZKGeoPoint(latitude=40.1123, longitude=-73.1234)
    polygon_1: ZKThreePointPolygon = ZKThreePointPolygon(vertice1=ZKGeoPoint(latitude=40.1123, longitude=-73.1234), vertice2=ZKGeoPoint(latitude=40.1123, longitude=-73.1234), vertice3=ZKGeoPoint(latitude=40.1123, longitude=-73.1234))
    polygon_2: ZKThreePointPolygon = ZKThreePointPolygon(vertice1=ZKGeoPoint(latitude=40.1123, longitude=-73.1234), vertice2=ZKGeoPoint(latitude=40.1123, longitude=-73.1234), vertice3=ZKGeoPoint(latitude=40.1123, longitude=-73.1234))
    polygon_3: ZKThreePointPolygon = ZKThreePointPolygon(vertice1=ZKGeoPoint(latitude=40.1123, longitude=-73.1234), vertice2=ZKGeoPoint(latitude=40.1123, longitude=-73.1234), vertice3=ZKGeoPoint(latitude=40.1123, longitude=-73.1234))

    proof: GeoPointIn3PointPolygonProof = my_coordinates.prove_geo_point_in_polygons(polygons=[polygon_1, polygon_2, polygon_3])

# Use Case: User wants to prove that their coordinates are NOT inside of a series of polygons
def prove_my_coordinates_not_in_polygons():
    prove_my_coordinates_in_polygons()

# Use Case: User wants to prove that their coordinates are inside of some polygons and NOT inside of others
def prove_my_coordinates_in_some_polygons_and_not_in_others():
    prove_my_coordinates_in_polygons()